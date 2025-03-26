import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Socket } from 'socket.io';

import { AppGateway } from 'src/gateway/app.gateway';

import { RedisService } from 'src/redis/redis.service';
import { parseOffer } from 'src/utils/helpers';

import { IContract, IOffer } from 'src/models/interfaces/offers.interfaces';

@Injectable()
export class OffersService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateway: AppGateway,
  ) { }

  async getOfferByIdOffer(idOffer: number) {
    const offerKey = this.redisService.getOfferKey(idOffer);
    const offer = await this.redisService.hgetall(offerKey);
    const parsedOffer: IOffer = {
      idOffer: parseInt(offer.idOffer),
      kwhOffer: parseFloat(offer.kwhOffer),
      kwhPrice: parseFloat(offer.kwhPrice),
      initialDate: offer.initialDate,
      finalDate: offer.finalDate
    }
    return parseOffer(parsedOffer);
  }

  async addOffer(offer: IOffer, idUser: string) {
    const offerKey = this.redisService.getOfferKey(offer.idOffer);
    const activeOffersKey = this.redisService.getActiveOffersKey();
    const expiredOffersKey = this.redisService.getExpiredOffersKey();
    const userOfferKey = this.redisService.getUserOfferKey(parseInt(idUser));

    const newOffer = { ...offer, idUser }
    const initialDate = new Date(offer.initialDate).getTime()
    const finalDate = new Date(offer.finalDate).getTime()
    const startAt = parseInt((initialDate / 1000).toString());
    const expiresAt = parseInt((finalDate / 1000).toString());

    await this.redisService.hmset(offerKey, newOffer);

    await this.redisService.zadd(activeOffersKey, startAt, offer.idOffer);
    await this.redisService.zadd(expiredOffersKey, expiresAt, offer.idOffer);

    await this.redisService.zadd(userOfferKey, startAt, offer.idOffer);

    const now = DateTime.now().setZone('America/Bogota').toSeconds() * 1000;
    if(initialDate <= now && finalDate >= now){
      await this.appGateway.addOffer(newOffer);
    }
  }

  async getAllActiveOffers() {
    const activeOffersKey = this.redisService.getActiveOffersKey();
    const now = DateTime.now().setZone('America/Bogota').toSeconds();

    const idOffersSet = await this.redisService.zrangebyscore(activeOffersKey, '-inf', parseInt(now + ""));

    const offers: IOffer[] = [];
    for (const idOffer of idOffersSet) {
      const offerKey = this.redisService.getOfferKey(parseInt(idOffer));
      const offer = await this.redisService.hgetall(offerKey);
      offers.push(parseOffer(offer));
    }

    return offers;
  }

  async removeExpiredOffers() {
    const expiredOffersKey = this.redisService.getExpiredOffersKey();
    const now = DateTime.now().setZone('America/Bogota').toSeconds();

    const idOffersSet: string[] = await this.redisService.zrangebyscore(expiredOffersKey, '-inf', parseInt(now + ""));
    this.redisService.zremrangebyscore(expiredOffersKey, '-inf', parseInt(now.toString()))

    this.removeOffer(idOffersSet);
    return idOffersSet;
  }

  async removeOffer(idOffersSet: string[]) {
    const activeOffersKey = this.redisService.getActiveOffersKey();

    for (const idOffer of idOffersSet) {
      const offerKey = this.redisService.getOfferKey(parseInt(idOffer))

      const offer: IOffer & { idUser: string } = await this.redisService.hgetall(offerKey);
      const idUserOffer = parseInt(offer.idUser)
      const userOfferKey = this.redisService.getUserOfferKey(idUserOffer)

      this.redisService.zrem(userOfferKey, idOffer);
      this.redisService.zrem(activeOffersKey, idOffer);
      this.redisService.del(offerKey);
    }

  }

  async getUserOffers(idUser: string) {
    const activeOffersKey = this.redisService.getUserOfferKey(parseInt(idUser));
    const now = DateTime.now().setZone('America/Bogota').toSeconds();
    const idsOffers = await this.redisService.zrangebyscore(activeOffersKey, '-inf', parseInt(now.toString()));
    const offers: IOffer[] = [];
    for (const idOffer of idsOffers) {
      const offer = await this.redisService.hgetall(this.redisService.getOfferKey(parseInt(idOffer)));
      offers.push(parseOffer(offer));
    }
    return offers;
  }

  async buyOffer(client: Socket, contract: IContract) {
    try {
      const expiredOffersKey = this.redisService.getExpiredOffersKey();
      const activeOffersKey = this.redisService.getActiveOffersKey();
      const offerKey = this.redisService.getOfferKey(contract.offer.idOffer);
      await this.redisService.watch(offerKey);
      const offer: IOffer & { idUser: string } = await this.redisService.hgetall(offerKey);
      if (!offer || Number(offer.kwhOffer) <= 0) {
        await this.redisService.unwatch();
        this.appGateway.notifyOfferNotAvailable(client, parseInt(offer.idUser));
        return;
      }
      const parsedOffer = {...parseOffer(offer), idUser: parseInt(offer.idUser)};

      const result = await this.redisService.multi()
        .hincrbyfloat(offerKey, "kwhOffer", -contract.kwhOffer)
        .exec();

      if (!result) {
        this.appGateway.notifyTryToBuyAgain(parsedOffer.idOffer);
        const updatedOffer = await this.getOfferByIdOffer(parsedOffer.idOffer);
        await this.appGateway.updateSingleOffer(parsedOffer.idOffer, updatedOffer);
        return;
      }
      if (Number(offer.kwhOffer) - contract.kwhOffer <= 0) {
        const userOfferKey = this.redisService.getUserOfferKey(parsedOffer.idUser)

        this.appGateway.notifyOfferNotAvailable(this.appGateway.server, parsedOffer.idOffer);
        this.redisService.zrem(expiredOffersKey, parsedOffer.idOffer)
        this.redisService.zrem(activeOffersKey, parsedOffer.idOffer)
        this.redisService.zrem(userOfferKey, parsedOffer.idOffer);
        this.redisService.del(offerKey);
      }
      await this.appGateway.leaveOfferRoom(client, contract.offer.idOffer)
      await this.appGateway.sendCompleteOffer(client, contract, parseInt(offer.idUser));
      this.appGateway.notifyTryToBuyAgain(parsedOffer.idOffer);
      const updatedOffer = await this.getOfferByIdOffer(parsedOffer.idOffer);
      await this.appGateway.updateSingleOffer(parsedOffer.idOffer, updatedOffer);

    } catch (err) {
      console.error(err)
    }
  }
}

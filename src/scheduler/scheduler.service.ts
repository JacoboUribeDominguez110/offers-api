import { Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';

import { AppGateway } from 'src/gateway/app.gateway';
import { OffersService } from 'src/offers/offers.service';

@Injectable()
export class SchedulerService {

  constructor(
    private readonly appGateway: AppGateway,
    private readonly offersService: OffersService
  ) { }

  async checkOffers() {
    try {
      const newOffers = await this.offersService.getAllActiveOffers();
      const expiredOffers = await this.offersService.removeExpiredOffers();

      const filteredOffers = newOffers.filter(o => !expiredOffers.includes(o.idOffer+""));

      this.appGateway.updateOffers(filteredOffers, expiredOffers);
    } catch(err){
      console.log(err)
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateOffers() {
    this.checkOffers();
  }
}

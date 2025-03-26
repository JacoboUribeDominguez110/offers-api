import { forwardRef, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WsJwtAuthGuard } from 'src/auth/auth.guard';
import GatewayRooms from './gateway.rooms';

import { RedisService } from 'src/redis/redis.service';
import { OffersService } from 'src/offers/offers.service';

import { IUser } from 'src/models/interfaces/shared.interfaces';
import { IContract, IOffer } from 'src/models/interfaces/offers.interfaces';
import { WebsocketReceiveMessages, WebsocketSendMessages } from 'src/models/enums/messages';


const port = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 3003
@WebSocketGateway(port, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true
  },
  namespace: 'ws'
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private rooms: GatewayRooms;

  constructor(
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => OffersService)) 
    private readonly offersService: OffersService,
  ) {
    this.rooms = new GatewayRooms();
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token || Array.isArray(token)) {
        throw new UnauthorizedException('No token provided');
      }
      const user = this.jwtService.verify(token) as (IUser | null);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      if (user.permissions.create_offers) {
        const activeOffersByUser = await this.offersService.getUserOffers(user.sub)
        client.emit(WebsocketSendMessages.ACTIVE_OFFERS_BY_USER, activeOffersByUser)
      } else {
        const activeOffers = await this.offersService.getAllActiveOffers()
        client.emit(WebsocketSendMessages.ACTIVE_OFFERS, activeOffers)
      }
    } catch (err) {
      console.log(err)
      client.disconnect();
      throw new UnauthorizedException('Authentication failed')
    }
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.SAVE_OFFER)
  handleSaveOffer(client: Socket, data: any): void {
    const idUser = client.data.user.sub;

    this.offersService.addOffer(data, idUser);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.BUY_OFFER)
  handleBuyOffer(socket: Socket, contract: IContract): void {
    this.offersService.buyOffer(socket, contract);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.JOIN_OFFER_ROOM)
  handleJoinOfferRoom(client: Socket): void {
    client.join(this.rooms.getOfferRoom(parseInt(client.data.user.sub)));
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.JOIN_USER_ROOM)
  handleJoinUserRoom(client: Socket): void {
    client.join(this.rooms.getUserRoom(parseInt(client.data.user.sub)));
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.LEAVE_OFFER_ROOM)
  handleLeaveOfferRoom(client: Socket, idOffer: string): void {
    this.leaveOfferRoom(client, parseInt(idOffer));
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WebsocketReceiveMessages.LEAVE_USER_ROOM)
  handleLeaveUserRoom(client: Socket): void {
    client.leave(this.rooms.getUserRoom(parseInt(client.data.user.sub)));
  }

  async leaveOfferRoom(client: Socket, idOffer: number){
    client.leave(this.rooms.getOfferRoom(idOffer));
  }

  async notifyOfferNotAvailable(client: Socket | Server, idOffer: number){
    client.emit(WebsocketSendMessages.OFFER_NOT_AVAILABLE, idOffer)
  }

  async notifyTryToBuyAgain(idOffer: number){
    this.server.to(this.rooms.getOfferRoom(idOffer)).emit(WebsocketSendMessages.TRY_TO_BUY_AGAIN)
  }

  async addOffer(offer: IOffer){
    this.server.emit(WebsocketSendMessages.ADD_OFFER, offer)
  }

  async updateSingleOffer(idOffer: number, offer: IOffer){
    this.server.emit(WebsocketSendMessages.UPDATE_OFFER, offer)
  }

  async updateOffers(newOffers: IOffer[], removeOffers: string[]) {
    this.server.emit(WebsocketSendMessages.UPDATE_OFFERS_BY_USER, [newOffers, removeOffers]);
  }

  async sendCompleteOffer(client: Socket, contract: IContract, idUserOffer: number) {
    client.emit(WebsocketSendMessages.COMPLETE_BUY, contract);
    this.server.to(this.rooms.getUserRoom(idUserOffer))
    .emit(WebsocketSendMessages.COMPLETE_BUY, contract)
  }
}

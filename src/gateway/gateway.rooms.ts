export default class GatewayRooms {
  
  constructor(){}

  getOfferRoom(idOffer: number){
    return `offer_room_${idOffer}`
  }

  getUserRoom(idUser: number){
    return `user_room_${idUser}`
  }
}
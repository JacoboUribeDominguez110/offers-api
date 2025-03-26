export default class OffersKeys {

  getActiveOffersKey(){
    return 'offers:active'
  }

  getExpiredOffersKey(){
    return 'offers:expired'
  }

  getOfferKey(idOffer: number){
    return `offers:${idOffer}`
  }

  getUserOfferKey(idUser: number){
    return `offers:user:${idUser}`
  }
}
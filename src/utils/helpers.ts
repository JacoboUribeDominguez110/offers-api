import { IOffer } from "src/models/interfaces/offers.interfaces"

export const parseOffer = (offer: any): IOffer => {
  return {
    idOffer: parseInt(offer.idOffer),
    kwhOffer: parseFloat(offer.kwhOffer),
    kwhPrice: parseFloat(offer.kwhPrice),
    initialDate: offer.initialDate,
    finalDate: offer.finalDate
  }
}
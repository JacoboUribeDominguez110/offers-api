export interface IOffer {
  idOffer: number,
  kwhOffer: number,
  kwhPrice: number,
  initialDate: string,
  finalDate: string
}

export interface IContract {
  idContract: number,
  createdAt: string,
  kwhOffer: number,
  offer: {
    idOffer: number,
    kwhOffer: number,
    kwhPrice: number,
    initialDate: Date;
    finalDate: Date;
  },
}
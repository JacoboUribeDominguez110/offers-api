export enum WebsocketSendMessages {
  ACTIVE_OFFERS = 'active_offers', 
  ADD_OFFER = 'add_offer', 
  COMPLETE_BUY = 'complete_buy', 
  UPDATE_OFFER = 'update_offer', 
  ACTIVE_OFFERS_BY_USER = 'active_offers_by_user', 
  UPDATE_OFFERS_BY_USER = 'update_active_offers', 
  OFFER_NOT_AVAILABLE = 'offer_not_available', 
  TRY_TO_BUY_AGAIN = 'try_to_but_again', 
}

export enum WebsocketReceiveMessages {
  SAVE_OFFER = 'save_offer', 
  BUY_OFFER = 'buy_offer', 
  JOIN_OFFER_ROOM = 'join_offer_room', 
  LEAVE_OFFER_ROOM = 'leave_offer_room', 
  JOIN_USER_ROOM = 'join_user_room', 
  LEAVE_USER_ROOM = 'leave_user_room', 
}
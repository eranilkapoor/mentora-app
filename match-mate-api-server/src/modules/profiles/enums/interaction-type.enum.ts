export enum InteractionType {
  //  DISCOVERY
  VIEW = 'view',
  PROFILE_VIEW = 'profile_view',

  //  INTENT (optional if using Interest system)
  SEND_INTEREST = 'send_interest',
  WITHDRAW_INTEREST = 'withdraw_interest',

  //  ENGAGEMENT
  SHORTLIST = 'shortlist',
  REMOVE_SHORTLIST = 'remove_shortlist',

  //  COMMUNICATION SIGNALS
  CHAT_INITIATED = 'chat_initiated',
  MESSAGE_SENT = 'message_sent',

  //  PREMIUM ACTIONS
  PROFILE_BOOST = 'profile_boost',
  CONTACT_VIEW = 'contact_view',

  //  SAFETY
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  REPORT = 'report',

  //  NEGATIVE SIGNALS
  HIDE = 'hide',
}

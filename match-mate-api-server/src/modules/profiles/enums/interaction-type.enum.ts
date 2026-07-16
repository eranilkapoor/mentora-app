export enum InteractionType {
  //  DISCOVERY
  VIEW = 'view',
  PROFILE_VIEW = 'profile_view',

  // Audit/mirror only. Formal request state belongs in the interests collection.
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

  // Audit/mirror only. Durable safety state belongs in safety collections.
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  REPORT = 'report',

  //  NEGATIVE SIGNALS
  HIDE = 'hide',
}

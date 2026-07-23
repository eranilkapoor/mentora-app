export enum InteractionType {
  //  DISCOVERY
  VIEW = 'view',
  PROFILE_VIEW = 'profile_view',

  // Audit/mirror only. Formal learning request state belongs in schedules.
  REQUEST_SESSION = 'request_session',
  WITHDRAW_SESSION_REQUEST = 'withdraw_session_request',

  //  ENGAGEMENT
  SAVE_SUBJECT = 'save_subject',
  REMOVE_SAVED_SUBJECT = 'remove_saved_subject',

  //  COMMUNICATION SIGNALS
  CHAT_INITIATED = 'chat_initiated',
  MESSAGE_SENT = 'message_sent',

  //  PREMIUM ACTIONS
  LEARNING_BOOST = 'learning_boost',
  CONTACT_VIEW = 'contact_view',

  // Audit/mirror only. Durable safety state belongs in safety collections.
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  REPORT = 'report',

  //  NEGATIVE SIGNALS
  HIDE = 'hide',
}

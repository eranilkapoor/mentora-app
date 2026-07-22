export const RATE_LIMIT_CONFIG = {
  // Authentication endpoints
  AUTH_LOGIN: {
    ttl: 900, // 15 minutes in seconds
    limit: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },

  AUTH_REGISTER: {
    ttl: 3600, // 1 hour
    limit: 3,
    message: 'Too many registration attempts.',
  },

  AUTH_OTP_SEND: {
    ttl: 3600,
    limit: 5,
    message: 'Too many OTP requests.',
  },

  AUTH_FORGOT_PASSWORD: {
    ttl: 3600,
    limit: 3,
    message: 'Too many password reset requests.',
  },

  // User profile endpoints
  USER_UPDATE: {
    ttl: 3600,
    limit: 10,
    message: 'Profile update limit reached.',
  },

  USER_AVATAR_UPLOAD: {
    ttl: 3600,
    limit: 5,
    message: 'Too many avatar uploads.',
  },

  // Match endpoints
  MATCH_SEND_INTEREST: {
    ttl: 86400, // 1 day
    limit: 50, // Free tier
    limitPremium: 200, // Premium tier
    message: 'Daily interest limit reached. Upgrade for more.',
  },

  MATCH_VIEW_PROFILE: {
    ttl: 86400,
    limit: 100,
    limitPremium: 500,
    message: 'Daily profile view limit reached.',
  },

  MATCH_SEARCH: {
    ttl: 3600,
    limit: 30,
    message: 'Too many search requests.',
  },

  // Chat endpoints
  CHAT_SEND_MESSAGE: {
    ttl: 3600,
    limit: 100,
    limitPremium: 500,
    message: 'Message rate limit exceeded.',
  },

  // General API
  GENERAL: {
    ttl: 3600,
    limit: 1000,
    message: 'API rate limit exceeded.',
  },
};

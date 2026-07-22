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

  // Learning endpoints
  LEARNING_SCHEDULE_SESSION: {
    ttl: 86400, // 1 day
    limit: 20,
    limitPremium: 100,
    message: 'Daily scheduling limit reached.',
  },

  LEARNING_AI_SESSION: {
    ttl: 86400,
    limit: 8,
    limitPremium: 50,
    message: 'Daily AI tutoring session limit reached.',
  },

  LEARNING_CATALOG_SEARCH: {
    ttl: 3600,
    limit: 30,
    message: 'Too many learning catalog search requests.',
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

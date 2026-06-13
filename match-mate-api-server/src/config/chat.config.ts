export default () => ({
  chat: {
    profanityFilter: {
      enabled: process.env.CHAT_PROFANITY_FILTER_ENABLED !== 'false',
      blockedWords: process.env.CHAT_PROFANITY_BLOCKED_WORDS || '',
      reviewWords: process.env.CHAT_MODERATION_REVIEW_WORDS || '',
    },
  },
});

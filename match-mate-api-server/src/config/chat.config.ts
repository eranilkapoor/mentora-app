export default () => ({
  chat: {
    profanityFilter: {
      enabled: process.env.CHAT_PROFANITY_FILTER_ENABLED !== 'false',
      blockedWords: process.env.CHAT_PROFANITY_BLOCKED_WORDS || '',
    },
  },
});

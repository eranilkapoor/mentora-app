export default () => ({
  mongo: {
    uri: process.env.MONGO_URI, // ✅ use full URI instead
    retryAttempts: parseInt(process.env.MONGO_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.MONGO_RETRY_DELAY || '5000', 10),
  },
});
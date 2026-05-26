export default () => ({
  mongo: {
    driver: process.env.DB_DRIVER,
    uri: process.env.MONGO_URI,
    retryAttempts: parseInt(process.env.MONGO_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.MONGO_RETRY_DELAY || '5000', 10),
  },
});

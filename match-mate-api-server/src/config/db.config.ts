export default () => ({
  mongo: {
    dbDriver: process.env.DB_DRIVER,
    uri: process.env.MONGO_URI, // ✅ use full URI instead
    retryAttempts: parseInt(process.env.MONGO_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.MONGO_RETRY_DELAY || '5000', 10),
  },
  rbacSync: process.env.RBAC_SYNC,
});
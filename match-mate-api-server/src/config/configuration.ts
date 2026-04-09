export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
  },
  dbDriver: process.env.DB_DRIVER,
  mongo: {
    uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?replicaSet=atlas-ymrq2p-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`,
    retryAttempts: process.env.MONGO_RETRY_ATTEMPTS
      ? parseInt(process.env.MONGO_RETRY_ATTEMPTS, 10)
      : 5,
    retryDelay: process.env.MONGO_RETRY_DELAY
      ? parseInt(process.env.MONGO_RETRY_DELAY, 10)
      : 5000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASS,
  },
  storage: {
    storageDriver: process.env.STORAGE_DRIVER,
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsS3Bucket: process.env.AWS_S3_BUCKET,
    awsS3BaseUrl: process.env.AWS_S3_BASE_URL
  },
  cacheDriver: process.env.CACHE_DRIVER
});

export default () => ({
  redis: {
    driver: process.env.CACHE_DRIVER,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASS,
    db: process.env.REDIS_DB,
  },
});

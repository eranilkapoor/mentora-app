export default () => ({
  env: process.env.NODE_ENV,
  host: process.env.HOST,
  port: parseInt(process.env.PORT || '3000', 10),
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },
});

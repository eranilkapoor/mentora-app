export default () => ({
  storage: {
    driver: process.env.STORAGE_DRIVER,
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    baseUrl: process.env.AWS_S3_BASE_URL,
  },
});
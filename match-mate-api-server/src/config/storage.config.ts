export default () => ({
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    awsRegion: process.env.AWS_REGION || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsS3Bucket: process.env.AWS_S3_BUCKET || '',
    awsS3BaseUrl: process.env.AWS_S3_BASE_URL || '',
  },
});

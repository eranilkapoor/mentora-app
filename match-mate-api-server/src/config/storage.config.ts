const PLACEHOLDER_SECRET_VALUES = new Set([
  'your_access_key',
  'your_secret_key',
  'change_me',
  'changeme',
  'placeholder',
  'replace_me',
  'REPLACE_ME',
]);

const optionalSecret = (value?: string): string => {
  const normalized = value?.trim() ?? '';
  return PLACEHOLDER_SECRET_VALUES.has(normalized) ? '' : normalized;
};

export default () => ({
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    awsRegion: process.env.AWS_REGION || '',
    awsAccessKeyId: optionalSecret(process.env.AWS_ACCESS_KEY_ID),
    awsSecretAccessKey: optionalSecret(process.env.AWS_SECRET_ACCESS_KEY),
    awsS3Bucket: process.env.AWS_S3_BUCKET || '',
    awsS3BaseUrl: process.env.AWS_S3_BASE_URL || '',
  },
});

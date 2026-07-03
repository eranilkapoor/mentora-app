import { config } from 'dotenv';
import { envValidationSchema } from './validation';

const nodeEnv = process.env.NODE_ENV || 'development';
config({ path: [`.env.${nodeEnv}`, '.env'], quiet: true });

const { error } = envValidationSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  convert: true,
});

if (error) {
  process.stderr.write(`Environment validation failed: ${error.message}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Environment validation passed.\n');
}

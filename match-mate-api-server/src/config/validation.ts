import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  DB_DRIVER: Joi.string().required(),
  MONGO_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
});
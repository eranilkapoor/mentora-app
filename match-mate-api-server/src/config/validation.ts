import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),

  PORT: Joi.number().default(3000),

  DB_DRIVER: Joi.string().required(),

  MONGO_URI: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),

  REDIS_PORT: Joi.number().default(6379),

  JWT_SECRET: Joi.string().required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  AWS_ACCESS_KEY_ID: Joi.string().optional(),
});

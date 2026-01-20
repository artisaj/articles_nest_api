import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  // Application
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string()
    .required()
    .description('PostgreSQL connection string'),

  // JWT
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description('JWT secret key (min 32 characters)'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // Redis (optional)
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // Swagger
  SWAGGER_ENABLED: Joi.boolean().default(true),
});

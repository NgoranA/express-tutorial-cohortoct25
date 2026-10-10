import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).default('info'),

  // option A
  DATABASE_URL: z.url('Please set DATABASE_URL'),

  // option B
  // DB_NAME:z.string() ,
  // DB_HOST: z.string(),
  // DB_PASSWORD: z.string(),
  // DB_PORT: z.string().default('5432').transform(Number),
  // DB_USER: z.string()
});

export const ENV = envSchema.parse(process.env);

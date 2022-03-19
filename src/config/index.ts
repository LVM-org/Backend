import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  PROGRAM_ID,
  ADMIN_PRIVATE_KEY,
  BUYER_PRIVATE_KEY,
  MEDIA_PROGRAM_KEY,
  AUTHOR_PRIVATE_KEY,
  TOKEN_PUBLIC_KEY,
  DISTRIBUTOR_PRIVATE_KEY,
  MEDIA_PUBLIC_KEY,
} = process.env;

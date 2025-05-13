import path from 'path';

import dotenv from 'dotenv';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL 環境變數未設置');
}
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('❌ Missing CLOUDINARY_API_KEY in environment variables');
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('❌ Missing CLOUDINARY_API_SECRET in environment variables');
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('❌ Missing CLOUDINARY_CLOUD_NAME in environment variables');
}
if (!process.env.LINE_CHANNEL_ID) {
  throw new Error('❌ Missing LINE_CHANNEL_ID in environment variables');
}
if (!process.env.LINE_CHANNEL_SECRET) {
  throw new Error('❌ Missing LINE_CHANNEL_SECRET in environment variables');
}
if (!process.env.REDIS_PASSWORD) {
  throw new Error('❌ Missing REDIS_PASSWORD in environment variables');
}
if (!process.env.REDIS_HOST) {
  throw new Error('❌ Missing REDIS_HOST in environment variables');
}
if (!process.env.REDIS_PORT) {
  throw new Error('❌ Missing REDIS_PORT in environment variables');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('❌ Missing GOOGLE_CLIENT_ID in environment variables');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('❌ Missing GOOGLE_CLIENT_SECRET in environment variables');
}
if (!process.env.SESSION_SECRET) {
  throw new Error('❌ Missing SESSION_SECRET in environment variables');
}

export const env = {
  PORT: process.env.PORT ?? 6543,
  DATABASE_URL: process.env.DATABASE_URL,
  DEV: process.env.API_BASE_URL_DEV,
  PROD: process.env.API_BASE_URL_PROD,
  FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV,
  FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  FB_CLIENT_ID: process.env.FB_CLIENT_ID,
  FB_CLIENT_SECRET: process.env.FB_CLIENT_SECRET,
};

export const serverUrl = process.env.NODE_ENV === 'production' ? env.PROD : env.DEV;
export const frontendUrl = process.env.NODE_ENV === 'production' ? env.FRONTEND_URL_PROD : env.FRONTEND_URL_DEV;

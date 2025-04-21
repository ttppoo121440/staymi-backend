import dotenv from 'dotenv';

dotenv.config();

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

export const env = {
  PORT: process.env.PORT ?? 6543,
  DATABASE_URL: process.env.DATABASE_URL,
  DEV: process.env.API_BASE_URL_DEV,
  PROD: process.env.API_BASE_URL_PROD,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export const serverUrl = process.env.NODE_ENV === 'production' ? env.PROD : env.DEV;

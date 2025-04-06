import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL 環境變數未設置');
}

export const env = {
  PORT: process.env.PORT ?? 6543,
  DATABASE_URL: process.env.DATABASE_URL,
};

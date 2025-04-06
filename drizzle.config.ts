import { config } from 'dotenv';
config();

export default {
  schema: './src/database/schemas/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
};

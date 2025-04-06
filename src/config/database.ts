import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from './env';

// 建立 PostgreSQL 連線池
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // 設定最大連線數
});

export const db = drizzle(pool);

// 添加關閉資料庫連線的方法
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

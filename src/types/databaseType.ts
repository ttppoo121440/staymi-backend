import { ExtractTablesWithRelations } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';

import { db } from '@/config/database';

// 定義 Tx 型別
export type Tx = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

// Union 型別：db 或 tx 實例
export type DatabaseOrTransaction = typeof db | Tx;

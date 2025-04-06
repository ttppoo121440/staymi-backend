import { integer, numeric, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

import { credit_package } from './creditPackage.schema';
import { user } from './user.schema';

export const credit_purchase = pgTable('credit_purchase', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => user.id), // 建立與 user 表的關聯
  credit_package_id: integer('credit_package_id')
    .notNull()
    .references(() => credit_package.id), // 建立與 credit_package 表的關聯
  purchased_credits: integer('purchased_credits').notNull(),
  price_paid: numeric('price_paid', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  purchase_at: timestamp('purchase_at').defaultNow(),
});

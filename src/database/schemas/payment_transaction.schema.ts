import { pgTable, uuid, pgEnum, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const orderTypeEnum = pgEnum('order_type', ['room', 'subscription']);
export const statusEnum = pgEnum('status', ['pending', 'confirmed', 'cancelled']);

export const payment_transaction = pgTable('payment_transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  order_type: orderTypeEnum('order_type').notNull(),
  status: statusEnum('status').notNull().default('pending'),
  method: varchar('method', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  gateway_transaction_id: varchar('gateway_transaction_id', { length: 255 }).notNull(),
  fee: integer('fee').default(0),
  net_income: integer('net_income').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

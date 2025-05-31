import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

import { order_subscription } from './order_subscription.schema';
import { payment_transaction } from './payment_transaction.schema';

export const payment_order_subscription = pgTable('payment_order_subscription', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id')
    .notNull()
    .references(() => payment_transaction.id),
  order_id: uuid('order_id')
    .notNull()
    .references(() => order_subscription.id),
  created_at: timestamp('created_at').defaultNow(),
});

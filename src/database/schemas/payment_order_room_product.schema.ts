import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

import { order_room_product } from './order_room_product.schema';
import { payment_transaction } from './payment_transaction.schema';

export const payment_order_room_product = pgTable('payment_order_room_product', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id')
    .notNull()
    .references(() => payment_transaction.id),
  order_id: uuid('order_id')
    .notNull()
    .references(() => order_room_product.id),
  created_at: timestamp('created_at').defaultNow(),
});

import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

import { order_room_product } from './order_room_product.schema';
import { product_plans } from './product_plans.schema';

export const statusEnum = pgEnum('status', ['pending', 'confirmed', 'cancelled']);

export const order_room_product_item = pgTable('order_room_product_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id')
    .notNull()
    .references(() => order_room_product.id),
  product_plans_id: uuid('product_plans_id')
    .notNull()
    .references(() => product_plans.id),
  quantity: integer('quantity').notNull(),
  unit_price: integer('unit_price').notNull(),
  status: statusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

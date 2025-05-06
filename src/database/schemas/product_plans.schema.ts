import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, date, timestamp, uuid } from 'drizzle-orm/pg-core';

import { hotels } from './hotels.schema';
import { products } from './products.schema';

export const product_plans = pgTable('product_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  product_id: uuid('product_id')
    .notNull()
    .references(() => products.id),
  price: integer('price').notNull(),
  start_date: date('start_time').notNull(),
  end_date: date('end_time').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type InsertProductPlan = InferInsertModel<typeof product_plans>;
export type SelectProductPlan = InferSelectModel<typeof product_plans>;
export type UpdateProductPlan = Partial<InsertProductPlan>;
export type DeleteProductPlan = Pick<SelectProductPlan, 'id' | 'hotel_id'>;

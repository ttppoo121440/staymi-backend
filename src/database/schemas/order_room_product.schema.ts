import { pgTable, uuid, timestamp, integer, pgEnum, varchar } from 'drizzle-orm/pg-core';

import { hotels } from './hotels.schema';
import { room_plans } from './room_plans.schema';
import { user } from './user.schema';

export const statusEnum = pgEnum('status', ['pending', 'confirmed', 'cancelled']);

export const order_room_product = pgTable('order_room_product', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  room_plans_id: uuid('room_plans_id')
    .notNull()
    .references(() => room_plans.id),
  transaction_id: varchar('transaction_id', { length: 100 }),
  check_in_date: timestamp('check_in_date').defaultNow(),
  check_out_date: timestamp('check_out_date').defaultNow(),
  total_price: integer('total_price').notNull(),
  status: statusEnum('status').notNull().default('pending'),
  payment_name: varchar('payment_name', { length: 50 }).notNull(),
  payment_phone: varchar('payment_phone', { length: 20 }).notNull(),
  payment_email: varchar('payment_email', { length: 320 }).unique().notNull(),
  contact_name: varchar('contact_name', { length: 50 }).notNull(),
  contact_phone: varchar('contact_phone', { length: 20 }).notNull(),
  contact_email: varchar('contact_email', { length: 320 }).unique().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

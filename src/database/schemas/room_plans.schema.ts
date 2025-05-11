import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, date, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { hotel_rooms } from './hotel_rooms.schema';
import { hotels } from './hotels.schema';

export const room_plans = pgTable('room_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  hotel_room_id: uuid('hotel_room_id')
    .notNull()
    .references(() => hotel_rooms.id),
  price: integer('price').notNull(),
  subscription_price: integer('subscription_price').notNull(),
  images: varchar('images').array().default([]),
  start_date: date('start_time').notNull(),
  end_date: date('end_time').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type InsertRoomPlan = InferInsertModel<typeof room_plans>;
export type SelectRoomPlan = InferSelectModel<typeof room_plans>;
export type UpdateRoomPlan = Partial<InsertRoomPlan>;
export type DeleteRoomPlan = Pick<SelectRoomPlan, 'id' | 'hotel_id'>;
export type SelectRoomPlanPrice = Pick<SelectRoomPlan, 'subscription_price' | 'price'>;

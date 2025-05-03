import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { hotels } from './hotels.schema';
import { room_types } from './room_types.schema';

export const userBrandRoleEnum = pgEnum('user_brand_role', ['owner', 'manager', 'staff']);

export const hotel_rooms = pgTable('hotel_rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  room_type_id: uuid('room_type_id')
    .notNull()
    .references(() => room_types.id),
  basePrice: integer('basePrice').notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('imageUrl', { length: 255 }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type InsertHotelRoom = InferInsertModel<typeof hotel_rooms>;
export type SelectHotelRoom = InferSelectModel<typeof hotel_rooms>;

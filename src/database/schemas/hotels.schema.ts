import { boolean, decimal, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { brand } from './brand.schema';

export const hotels = pgTable('hotels', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id')
    .notNull()
    .references(() => brand.id),
  region: varchar('region', { length: 50 }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  address: varchar('address', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  transportation: varchar('transportation', { length: 255 }).notNull(),
  hotel_policies: varchar('hotel_policies', { length: 255 }).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 6 }).notNull(), // 精確到小數點後 6 位
  longitude: decimal('longitude', { precision: 10, scale: 6 }).notNull(), // 精確到小數點後 6 位
  hotel_facilities: varchar('hotel_facilities', { length: 50 }).array().notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

import { pgTable, uuid, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

import { hotels } from './hotels.schema';

export const hotel_images = pgTable('hotel_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  image_url: varchar('image_url', { length: 255 }).notNull(),
  is_cover: boolean('is_cover').notNull().default(true),
  position: integer('position').notNull().default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

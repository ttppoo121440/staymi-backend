import { pgTable, text, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

import { hotels } from './hotels.schema';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id')
    .notNull()
    .references(() => hotels.id),
  name: varchar('name', { length: 50 }).notNull(),
  features: varchar('features', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('imageUrl', { length: 255 }).notNull(),
  is_active: boolean('is_active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

import { timestamp, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { brand } from './brand.schema';

export const room_types = pgTable('room_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id')
    .notNull()
    .references(() => brand.id),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  room_service: varchar('room_service', { length: 50 }).array().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

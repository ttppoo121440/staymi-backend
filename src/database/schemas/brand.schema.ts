import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const brand = pgTable('brand', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  logo_url: varchar('logo', { length: 255 }).notNull(),
  title: varchar('title', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
});

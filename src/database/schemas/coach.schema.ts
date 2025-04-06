import { pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const coach = pgTable('coach', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => user.id), // 建立與 user 表的關聯
  experience_years: integer('experience_years').notNull(),
  description: text('description').notNull(),
  profile_image_url: varchar('profile_image_url', { length: 2048 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

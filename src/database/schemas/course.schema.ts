import { pgTable, serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

import { skill } from './skill.schema';
import { user } from './user.schema';

export const course = pgTable('course', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => user.id), // 建立與 user 表的關聯
  skill_id: integer('skill_id')
    .notNull()
    .references(() => skill.id), // 建立與 skill 表的關聯
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  start_at: timestamp('start_at').notNull(),
  end_at: timestamp('end_at').notNull(),
  max_participants: integer('max_participants').notNull(),
  meeting_url: varchar('meeting_url', { length: 2048 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

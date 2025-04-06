import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

import { coach } from './coach.schema';
import { skill } from './skill.schema';

export const coach_link_skill = pgTable('coach_link_skill', {
  id: serial('id').primaryKey(),
  coach_id: integer('coach_id')
    .notNull()
    .references(() => coach.id), // 建立與 coach 表的關聯
  skill_id: integer('skill_id')
    .notNull()
    .references(() => skill.id), // 建立與 skill 表的關聯
  created_at: timestamp('created_at').defaultNow(),
});

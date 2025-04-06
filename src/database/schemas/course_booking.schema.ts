import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

import { course } from './course.schema';
import { user } from './user.schema';

export const course_booking = pgTable('course_booking', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => user.id), // 建立與 user 表的關聯
  course_id: integer('course_id')
    .notNull()
    .references(() => course.id), // 建立與 course 表的關聯
  booking_at: timestamp('booking_at').defaultNow(),
  status: varchar('status', { length: 20 }).notNull(),
  join_at: timestamp('join_at'),
  leave_at: timestamp('leave_at'),
  cancelled_at: timestamp('cancelled_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

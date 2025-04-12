import { pgTable, varchar, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const genderEnum = pgEnum('gender', ['f', 'm']);

export const user_profile = pgTable('user_profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  name: varchar('name', { length: 50 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  birthday: timestamp('birthday'),
  gender: genderEnum('gender').notNull().default('m'),
  avatar: varchar('avatar', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

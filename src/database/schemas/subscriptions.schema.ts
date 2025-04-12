import { pgTable, varchar, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const planEnum = pgEnum('plan', ['free', 'plus', 'pro']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  plan: planEnum('plan').notNull().default('free'),
  status: varchar('status', { length: 20 }).notNull(),
  started_at: timestamp('started_at').notNull(),
  end_at: timestamp('end_at').notNull(),
  is_recurring: boolean('is_recurring').notNull().default(false),
  cancelled_at: timestamp('cancelled_at'),
  paytime: timestamp('paytime'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

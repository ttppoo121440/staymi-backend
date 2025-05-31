import { pgTable, uuid, pgEnum, date, timestamp } from 'drizzle-orm/pg-core';

import { subscriptions } from './subscriptions.schema';
import { user } from './user.schema';

export const cycleEnum = pgEnum('order_subscription_cycle', ['monthly', 'quarterly', 'yearly']);
export const statusEnum = pgEnum('order_subscription_status', ['active', 'paused', 'cancelled']);

export const order_subscription = pgTable('order_subscription', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  subscription_id: uuid('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  cycle: cycleEnum('cycle'),
  next_billing_date: date('next_billing_date'),
  status: statusEnum('status'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

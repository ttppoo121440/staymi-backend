import { boolean, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { brand } from './brand.schema';
import { user } from './user.schema';

export const userBrandRoleEnum = pgEnum('user_brand_role', ['owner', 'manager', 'staff']);

export const user_brand = pgTable('user_brand', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  brand_id: uuid('brand_id')
    .notNull()
    .references(() => brand.id),
  role: userBrandRoleEnum('role').notNull().default('owner'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

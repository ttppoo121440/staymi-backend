import { pgTable, varchar, timestamp, pgEnum, uuid, boolean } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['consumer', 'store', 'admin']);

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  password: varchar('password', { length: 72 }).notNull(),
  provider: varchar('provider', { length: 20 }),
  provider_id: varchar('provider_id', { length: 50 }),
  role: roleEnum('role').notNull().default('consumer'),
  is_blacklisted: boolean('is_blacklisted').notNull().default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

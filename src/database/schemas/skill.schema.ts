import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const skill = pgTable('skill', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  created_at: timestamp('created_at').defaultNow(),
});

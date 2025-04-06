import { pgTable, serial, timestamp, integer, varchar } from 'drizzle-orm/pg-core';

export const credit_package = pgTable('credit_package', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  credit_amount: integer('credit_amount').notNull(),
  price: integer('price').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

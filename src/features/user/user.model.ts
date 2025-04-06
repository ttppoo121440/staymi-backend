import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { user } from '@/database/schemas/user.schema';

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

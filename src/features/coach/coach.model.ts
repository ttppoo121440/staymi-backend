import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coach } from '@/database/schemas/coach.schema';

export const insertCoachSchema = createInsertSchema(coach);
export const selectCoachSchema = createSelectSchema(coach);

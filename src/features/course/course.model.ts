import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { course } from '@/database/schemas/course.schema';

export const insertCourseSchema = createInsertSchema(course);
export const selectCourseSchema = createSelectSchema(course);

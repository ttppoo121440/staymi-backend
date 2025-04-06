import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { course_booking } from '@/database/schemas/course_booking.schema';

export const insertCourse_bookingSchema = createInsertSchema(course_booking);
export const selectCourse_bookingSchema = createSelectSchema(course_booking);

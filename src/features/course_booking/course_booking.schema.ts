import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const Course_bookingResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  course_id: z.number(),
  booking_at: z.preprocess((val) => formatDate(val), z.string()),
  status: z.string(),
  join_at: z.preprocess((val) => formatDate(val), z.string()),
  leave_at: z.preprocess((val) => formatDate(val), z.string()),
  cancelled_at: z.preprocess((val) => formatDate(val), z.string()),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const Course_bookingArrayResponseSchema = z.array(Course_bookingResponseSchema);

export const Course_bookingCreate = Course_bookingResponseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Course_bookingResponse = z.infer<typeof Course_bookingResponseSchema>;

export type Course_bookingCreateType = z.infer<typeof Course_bookingCreate>;

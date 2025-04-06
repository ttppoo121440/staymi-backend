import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const CourseResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  skill_id: z.number(),
  name: z.string({ message: '請輸入名稱' }).max(100, { message: '名稱最多100個字' }),
  description: z.string({ message: '請輸入描述' }).max(500, { message: '描述最多500個字' }),
  start_at: z.preprocess((val) => formatDate(val), z.string()),
  end_at: z.preprocess((val) => formatDate(val), z.string()),
  max_participants: z.number().min(1, { message: '請輸入人數' }),
  meeting_url: z.string(),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const CourseArrayResponseSchema = z.array(CourseResponseSchema);

export const CourseCreate = CourseResponseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CourseResponse = z.infer<typeof CourseResponseSchema>;

export type CourseCreateType = z.infer<typeof CourseCreate>;

import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const CoachResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  experience_years: z.number({ message: '請輸入經驗年數' }).int({ message: '經驗年數必須是整數' }),
  description: z.string({ message: '請輸入描述' }).max(500, { message: '描述最多500個字' }),
  profile_image_url: z.string(),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const CoachArrayResponseSchema = z.array(CoachResponseSchema);

export const CoachCreate = CoachResponseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

export type CoachCreateType = z.infer<typeof CoachCreate>;

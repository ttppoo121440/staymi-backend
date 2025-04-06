import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const skillResponseSchema = z.object({
  id: z.number(),
  name: z.string({ message: '請輸入名字' }).max(50, { message: '名字最多50個字' }),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const skillArrayResponseSchema = z.array(skillResponseSchema);

export type SkillResponseType = z.infer<typeof skillResponseSchema>;

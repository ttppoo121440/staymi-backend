import { z } from 'zod';

import { parseZodDate } from '@/utils/formatDate';

const user_profileBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string({ message: '請輸入名字' }).min(2, { message: '名字至少2個字' }).max(50, { message: '名字最多50個字' }),
  phone: z.string({ message: '請輸入電話號碼' }),
});

export const user_profileSchema = user_profileBaseSchema.extend({
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
});

export const user_profileUpdateSchema = user_profileBaseSchema.omit({ id: true, user_id: true }).extend({
  birthday: parseZodDate(),
  gender: z.enum(['f', 'm'], { errorMap: () => ({ message: '性別格式錯誤' }) }),
  avatar: z.string().optional(),
});

export type user_profileType = z.infer<typeof user_profileSchema>;
export type user_profileUpdateType = z.infer<typeof user_profileUpdateSchema>;

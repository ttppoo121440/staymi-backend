import { z } from 'zod';

import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

const user_profileBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string({ message: '請輸入名字' }).min(2, { message: '名字至少2個字' }).max(50, { message: '名字最多50個字' }),
  phone: z.string({ message: '請輸入電話號碼' }),
});

export const user_profileSchema = user_profileBaseSchema.extend({
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
});

export const user_profileToDTO = z
  .object({
    user: user_profileSchema,
  })
  .transform((data) => ({
    user: {
      ...data.user,
    },
  }));

export const user_profileUpdateSchema = user_profileBaseSchema.omit({ user_id: true }).extend({
  birthday: zDateOrDefault(),
  gender: z.enum(['f', 'm'], { errorMap: () => ({ message: '性別格式錯誤' }) }),
});

export const user_profileUpdateToDTO = z
  .object({
    user: user_profileUpdateSchema.extend({
      updated_at: zDateOrDefault(),
    }),
  })
  .transform((data) => ({
    user: {
      ...data.user,
      birthday: formatDisplayDate(data.user.birthday),
      updated_at: formatDisplayDate(data.user.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export type user_profileType = z.infer<typeof user_profileSchema>;
export type user_profileUpdateType = z.infer<typeof user_profileUpdateSchema>;

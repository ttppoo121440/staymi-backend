import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string({ message: '請輸入名字' }).max(50, { message: '名字最多50個字' }),
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
  password: z.string({ message: '請輸入密碼' }).min(8, { message: '密碼至少8個字' }),
  role: z.string({ message: '請選擇角色' }).max(20, { message: '角色最多20個字' }),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const UserArrayResponseSchema = z.array(UserResponseSchema);

export const UserCreateSchema = UserResponseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type UserCreateType = z.infer<typeof UserCreateSchema>;

export type UserResponseType = z.infer<typeof UserResponseSchema>;

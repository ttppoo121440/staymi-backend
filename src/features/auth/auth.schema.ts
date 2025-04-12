import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const roleEnumList = ['consumer', 'store', 'admin'] as const;

export const AuthResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string({ message: '請輸入名字' }).min(2, { message: '名字至少2個字' }).max(50, { message: '名字最多50個字' }),
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
  password: z.string({ message: '請輸入密碼' }).min(8, { message: '密碼至少8個字' }),
  phone: z.string({ message: '請輸入電話號碼' }),
  birthday: z.string({ message: '請輸入生日' }).refine((val) => !isNaN(Date.parse(val)), {
    message: '請輸入正確的日期格式',
  }),
  gender: z.enum(['f', 'm'], { message: '請選擇性別' }),
  avatar: z.string().optional(),
  provider: z.string().optional(),
  provider_id: z.string().optional(),
  role: z.enum(roleEnumList),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  updated_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const AuthArrayResponseSchema = z.array(AuthResponseSchema);

export const AuthCreateSchema = AuthResponseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const AuthLoginSchema = AuthResponseSchema.pick({
  email: true,
  password: true,
});

export type AuthLoginType = z.infer<typeof AuthLoginSchema>;
export type AuthCreateType = z.infer<typeof AuthCreateSchema>;
export type AuthResponseType = z.infer<typeof AuthResponseSchema>;

export type Role = (typeof roleEnumList)[number];

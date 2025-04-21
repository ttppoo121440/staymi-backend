import { z } from 'zod';

import { parseZodDate } from '@/utils/formatDate';

export const authStoreSignupSchema = z.object({
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
  password: z.string({ message: '請輸入密碼' }).min(8, { message: '密碼至少8個字' }),
  title: z.string({ message: '請輸入商店名稱' }).min(2, { message: '商店名稱至少2個字' }),
  description: z.string({ message: '請輸入商店描述' }),
  name: z.string({ message: '請輸入名字' }).min(2, { message: '名字至少2個字' }).max(50, { message: '名字最多50個字' }),
  phone: z.string({ message: '請輸入電話號碼' }),
  birthday: parseZodDate(),
  gender: z.enum(['f', 'm'], { message: '請選擇性別' }),
});

export const authStoreUpdateSchema = authStoreSignupSchema
  .pick({
    title: true,
    description: true,
    name: true,
    phone: true,
    birthday: true,
    gender: true,
  })
  .extend({
    logo_url: z.string().optional(),
  });

export const authStoreUploadLogoSchema = z.object({
  logo_url: z.string({ message: '請上傳圖片' }),
});

export type AuthStoreSignupType = z.infer<typeof authStoreSignupSchema>;
export type AuthStoreUpdateType = z.infer<typeof authStoreUpdateSchema>;

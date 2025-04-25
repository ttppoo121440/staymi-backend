import { z } from 'zod';

import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const authStoreSignupSchema = z.object({
  email: z.string({ message: '請輸入信箱' }).email({ message: '信箱格式錯誤' }),
  password: z.string({ message: '請輸入密碼' }).min(8, { message: '密碼至少8個字' }),
  title: z.string({ message: '請輸入商店名稱' }).min(2, { message: '商店名稱至少2個字' }),
  description: z.string({ message: '請輸入商店描述' }),
  name: z.string({ message: '請輸入名字' }).min(2, { message: '名字至少2個字' }).max(50, { message: '名字最多50個字' }),
  phone: z.string({ message: '請輸入電話號碼' }),
  birthday: zDateOrDefault(),
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

export const authStoreUpdateToDTO = z
  .object({
    store: authStoreUpdateSchema,
  })
  .transform((data) => ({
    store: {
      ...data.store,
      birthday: formatDisplayDate(data.store.birthday),
      updated_at: formatDisplayDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const authStoreUploadLogoSchema = z.object({
  id: z.string().uuid(),
  logo_url: z.string({ message: '請上傳圖片' }),
});

export type AuthStoreSignupType = z.infer<typeof authStoreSignupSchema>;
export type AuthStoreUpdateType = z.infer<typeof authStoreUpdateSchema>;
export type authStoreUploadLogoType = z.infer<typeof authStoreUploadLogoSchema>;

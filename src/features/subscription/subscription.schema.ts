import { z } from 'zod';

import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

// 定義基本訂閱資料結構
const subscripttionBaseSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  user_id: z.string().uuid({ message: '請填正確 id 格式' }),
  plan: z.enum(['free', 'plus', 'pro'], { errorMap: () => ({ message: '訂閱計畫格式錯誤' }) }),
  status: z.string({ message: '狀態格式錯誤' }),
  start_at: zDateOrDefault(),
  end_at: zDateOrDefault(),
  is_recurring: z.boolean({ message: '參數錯誤，請確認 is_recurring 為布林值' }),
  cancelled_at: zDateOrDefault().nullable(),
  paytime: zDateOrDefault().nullable(),
});

// 查詢個人訂閱狀態
export const subscriptionSchema = subscripttionBaseSchema.pick({ plan: true, end_at: true });

// 取消自動訂閱
export const subscriptionIsRecurringBodySchema = subscripttionBaseSchema.pick({ is_recurring: true });
export const subscriptionIsRecurringSchema = subscripttionBaseSchema.pick({ is_recurring: true });

// 資料轉換為 DTO 格式
export const subscriptionToDTO = z
  .object({
    subscriptions: subscriptionSchema,
  })
  .transform((data) => ({
    subscriptions: {
      ...data.subscriptions,
      end_at: formatDisplayDate(data.subscriptions.end_at, 'YYYY-MM-DD'),
    },
  }));

export const subscriptionIsRecurringToDTO = z.object({
  is_recurring: z.boolean(),
});

export type subscriptionType = z.infer<typeof subscriptionSchema>;
export type subscriptionIsRecurringType = z.infer<typeof subscriptionIsRecurringSchema>;

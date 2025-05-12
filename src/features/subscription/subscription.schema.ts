import { z } from 'zod';

import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

// 定義基本訂閱資料結構
const subscripttionBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan: z.enum(['free', 'plus', 'pro'], { errorMap: () => ({ message: '訂閱計畫格式錯誤' }) }),
  status: z.string({ message: '狀態格式錯誤' }),
});

// 排除不需欄位 新增end_at
export const subscriptionSchema = subscripttionBaseSchema.omit({ id: true, user_id: true, status: true }).extend({
  end_at: zDateOrDefault(),
});

export const subscriptionIsRecurringSchema = subscripttionBaseSchema
  .omit({ id: true, user_id: true, status: true, plan: true })
  .extend({
    is_recurring: z.boolean(),
  });

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

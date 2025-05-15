import { z } from 'zod';

import { paginationSchema, QuerySchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

// 定義基本訂閱資料結構
const subscriptionBaseSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  user_id: z.string().uuid({ message: '請填正確 id 格式' }),
  plan: z.enum(['free', 'plus', 'pro'], { errorMap: () => ({ message: '訂閱方案格式錯誤' }) }),
  status: z.string({ message: '狀態格式錯誤' }),
  started_at: zDateOrDefault(),
  end_at: zDateOrDefault(),
  is_recurring: z.boolean({ message: '參數錯誤，請確認 is_recurring 為布林值' }),
  cancelled_at: zDateOrDefault(),
  paytime: zDateOrDefault(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

// 查詢個人訂閱狀態
export const subscriptionSchema = subscriptionBaseSchema.pick({ plan: true, end_at: true });

// 取消自動訂閱
export const subscriptionIsRecurringBodySchema = subscriptionBaseSchema.pick({ is_recurring: true });
export const subscriptionIsRecurringSchema = subscriptionBaseSchema.pick({ is_recurring: true });

// 查詢歷史訂閱紀錄
export const subscriptionHistoryQuerySchema = QuerySchema;

export const subscriptionPlanBodySchema = subscriptionBaseSchema.pick({ plan: true });
export const subscriptionPlanSchema = subscriptionBaseSchema.pick({ plan: true }).extend({ isUpdate: z.boolean() });

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

export const subscriptionHistoryToDTO = z
  .object({
    history: z.array(subscriptionBaseSchema.omit({ user_id: true, created_at: true, updated_at: true })),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    history: data.history.map((his) => ({
      ...his,
      started_at: his.started_at ? formatDisplayDate(his.started_at, 'YYYY-MM-DD HH:mm:ss') : null,
      end_at: his.end_at ? formatDisplayDate(his.end_at, 'YYYY-MM-DD HH:mm:ss') : null,
      cancelled_at: his.cancelled_at ? formatDisplayDate(his.cancelled_at, 'YYYY-MM-DD HH:mm:ss') : null,
      paytime: his.paytime ? formatDisplayDate(his.paytime, 'YYYY-MM-DD HH:mm:ss') : null,
    })),
    pagination: data.pagination,
  }));

export type subscriptionType = z.infer<typeof subscriptionSchema>;
export type subscriptionIsRecurringType = z.infer<typeof subscriptionIsRecurringSchema>;
export type subscriptionHistoryType = z.infer<typeof subscriptionBaseSchema>;
export type subscriptionPlanType = z.infer<typeof subscriptionPlanSchema>;

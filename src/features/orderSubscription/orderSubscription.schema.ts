import { z } from 'zod';

import { zDateOrDefault } from '@/utils/formatDate';

const orderSubscriptionBaseSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  user_id: z.string().uuid({ message: 'user id 錯誤' }),
  subscription_id: z.string().uuid({ message: '訂閱 id 錯誤' }),
  cycle: z.enum(['monthly', 'quarterly', 'yearly'], { errorMap: () => ({ message: '訂閱方案週期錯誤' }) }),
  next_billing_date: zDateOrDefault(),
  status: z.enum(['active', 'paused', 'cancelled'], { errorMap: () => ({ message: '狀態錯誤' }) }),
  paypal_order_id: z.string().nullable().optional(),
  paypal_transaction_id: z.string().nullable().optional(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const orderSubscriptionCreateSchema = orderSubscriptionBaseSchema.pick({
  user_id: true,
  subscription_id: true,
  cycle: true,
  next_billing_date: true,
  status: true,
});

export const orderSubscriptionSchema = orderSubscriptionBaseSchema.extend({
  created_at: zDateOrDefault().nullable().optional(),
  updated_at: zDateOrDefault().nullable().optional(),
});

export const orderSubscriptionUpdateSchema = orderSubscriptionBaseSchema
  .pick({
    status: true,
  })
  .extend({
    paypal_transaction_id: z.string().optional(),
  });

export type orderSubscriptionDTOType = z.infer<typeof orderSubscriptionBaseSchema>;
export type orderSubscriptionCreateType = z.infer<typeof orderSubscriptionCreateSchema>;
export type orderSubscriptionType = z.infer<typeof orderSubscriptionSchema>;
export type orderSubscriptionUpdateType = z.infer<typeof orderSubscriptionUpdateSchema>;

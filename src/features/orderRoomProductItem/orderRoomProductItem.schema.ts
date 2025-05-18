import { z } from 'zod';

import { zDateOrDefault } from '@/utils/formatDate';

const StatusEnum = z.enum(['pending', 'confirmed', 'cancelled'], {
  message: '狀態只能是 pending、confirmed、cancelled',
});

export const orderRoomProductItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_plans_id: z.string().uuid(),
  quantity: z.number({ message: '請填寫數量' }).min(1, { message: '數量必須大於 0' }),
  unit_price: z.number(),
  status: StatusEnum,
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const orderRoomProductItemCreateSchema = orderRoomProductItemSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
});

export const orderRoomProductItemDto = z.object({
  order_item: orderRoomProductItemSchema.omit({
    created_at: true,
    updated_at: true,
  }),
});

export type OrderRoomProductItemType = z.infer<typeof orderRoomProductItemSchema>;
export type OrderRoomProductItemCreateType = z.infer<typeof orderRoomProductItemCreateSchema>;

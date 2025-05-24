import { z } from 'zod';

import { zDateOrDefault } from '@/utils/formatDate';

export const payment_order_room_productSchema = z.object({
  transaction_id: z.string().uuid(),
  order_id: z.string().uuid(),
  created_at: zDateOrDefault(),
});

export type PaymentOrderRoomProductType = z.infer<typeof payment_order_room_productSchema>;

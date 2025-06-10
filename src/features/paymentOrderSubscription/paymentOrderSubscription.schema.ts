import { z } from 'zod';

import { zDateOrDefault } from '@/utils/formatDate';

export const paymentOrderSubscriptionSchema = z.object({
  transaction_id: z.string().uuid(),
  order_id: z.string().uuid(),
  created_at: zDateOrDefault(),
});

export type paymentOrderSubscriptionType = z.infer<typeof paymentOrderSubscriptionSchema>;

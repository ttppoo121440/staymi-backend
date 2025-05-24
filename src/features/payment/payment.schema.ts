import { z } from 'zod';

import { zDateOrDefault } from '@/utils/formatDate';

export const paymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  order_type: z.enum(['room', 'subscription']),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  method: z.string().max(50),
  amount: z.number().int(),
  gateway_transaction_id: z.string().max(255),
  fee: z.number().int().default(0),
  net_income: z.number().int().default(0),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const paymentCreateSchema = paymentSchema.omit({ id: true });

export type PaymentType = z.infer<typeof paymentSchema>;
export type PaymentCreateType = z.infer<typeof paymentCreateSchema>;

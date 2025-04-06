import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const Credit_purchaseResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  credit_package_id: z.number(),
  purchased_credits: z.number(),
  price_paid: z.string(),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
  purchase_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const Credit_purchaseArrayResponseSchema = z.array(Credit_purchaseResponseSchema);

export const Credit_purchaseCreateSchema = Credit_purchaseResponseSchema.omit({
  id: true,
  created_at: true,
  purchase_at: true,
});

export type Credit_purchaseCreateType = z.infer<typeof Credit_purchaseCreateSchema>;

export type Credit_purchaseResponseType = z.infer<typeof Credit_purchaseResponseSchema>;

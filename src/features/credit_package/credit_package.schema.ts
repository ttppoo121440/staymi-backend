import { z } from 'zod';

import { formatDate } from '@/utils/formatDate';

export const CreditPackageResponseSchema = z.object({
  id: z.number(),
  name: z.string({ message: '請輸入名字' }).max(50, { message: '名字最多50個字' }),
  credit_amount: z.number({ message: '請輸入卡金額' }).int({ message: '卡金額必須是整數' }),
  price: z.number({ message: '請輸入金額' }).int({ message: '金額必須是整數' }),
  created_at: z.preprocess((val) => formatDate(val), z.string()),
});

export const CreditPackageArrayResponseSchema = z.array(CreditPackageResponseSchema);

export const CreditPackageCreate = CreditPackageResponseSchema.omit({ id: true, created_at: true });

export type CreditPackageResponse = z.infer<typeof CreditPackageResponseSchema>;

export type CreditPackageCreateType = z.infer<typeof CreditPackageCreate>;

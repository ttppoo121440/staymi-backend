import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//原始欄位
const productPlanSchema = z.object({
  id: z.string().uuid().optional(),
  hotel_id: z.string({ message: '請填寫飯店 id' }).uuid({ message: '請填正確 id 格式' }),
  product_id: z.string({ message: '請填寫伴手禮 id' }).uuid({ message: '請填正確 id 格式' }),
  price: z.number({ message: '請填寫售價' }).min(1, '金額不得小於 1'),
  start_date: z.string({ message: '請填寫計畫開始日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  end_date: z.string({ message: '請填寫計畫結束日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  is_active: z.boolean(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

//可編輯的欄位
const editableFields = productPlanSchema
  .pick({
    product_id: true,
    price: true,
    start_date: true,
    end_date: true,
    is_active: true,
  })
  .partial();

export const productPlanCreateSchema = productPlanSchema.omit({ id: true, created_at: true, updated_at: true });

export const productPlanUpdateSchema = z
  .object({
    id: z.string().uuid({ message: '請填正確 id 格式' }),
    hotel_id: z.string().uuid(),
  })
  .merge(editableFields);

export const productPlanToggleActiveSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  hotel_id: z.string().uuid(),
  is_active: z.boolean(),
});

export const productPlanDeleteSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  hotel_id: z.string().uuid(),
});

export const productPlanDto = z
  .object({
    productPlan: productPlanSchema,
  })
  .transform((data) => ({
    productPlan: {
      ...data.productPlan,
      created_at: formatDisplayDate(data.productPlan.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.productPlan.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const productPlanListDto = z
  .object({
    productPlans: z.array(productPlanSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    productPlans: data.productPlans.map((productPlan) => ({
      ...productPlan,
      created_at: formatDisplayDate(productPlan.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(productPlan.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

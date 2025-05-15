import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const productsSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  name: z.string().min(1, '請輸入伴手禮名稱').max(50),
  features: z.string({ message: '請輸入伴手禮特色' }).max(255),
  description: z.string({ message: '請輸入伴手禮描述' }).max(255),
  price: z
    .number({ invalid_type_error: '請輸入數字', required_error: '請輸入伴手禮價格' })
    .min(0, { message: '價格必須大於等於 0' })
    .max(99999999, { message: '價格必須小於等於 99999999' }),
  imageUrl: z.string({ message: '請選擇伴手禮圖片' }),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const productsListDto = z
  .object({
    products: z.array(productsSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    products: data.products.map((product) => ({
      ...product,
      created_at: formatDisplayDate(product.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(product.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

export const productsDto = z
  .object({
    product: productsSchema,
  })
  .transform((data) => ({
    product: {
      ...data.product,
      created_at: formatDisplayDate(data.product.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.product.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const productsCreateSchema = productsSchema.omit({
  id: true,
  hotel_id: true,
  created_at: true,
  updated_at: true,
});
export const productsUpdateSchema = productsSchema.omit({
  id: true,
  hotel_id: true,
  created_at: true,
});

export type ProductsSchema = z.infer<typeof productsSchema>;
export type ProductsCreateType = z.infer<typeof productsCreateSchema> & { hotel_id: string };
export type ProductsUpdateType = z.infer<typeof productsUpdateSchema> & { id: string; hotel_id: string };

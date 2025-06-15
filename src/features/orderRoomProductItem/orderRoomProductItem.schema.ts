import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

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

export const productPlansSchema = z.object({
  id: z.string().uuid(),
  price: z.number(),
  start_time: z.string(),
  end_time: z.string(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_features: z.string(),
  product_description: z.string(),
  product_imageUrl: z.string(),
  product_price: z.number(),
});

export const orderRoomProductItemWithProductSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_plans_id: z.string().uuid(),
  quantity: z.number(),
  unit_price: z.number(),
  products_name: z.string(),
  products_imageUrl: z.string(),
  products_description: z.string(),
  products_features: z.string(),
  product_plans_price: z.number(),
  product_plans_start_time: z.string(),
  product_plans_end_time: z.string(),
});

const orderRoomProductWithItemsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  room_plans_id: z.string().uuid(),
  check_in_date: zDateOrDefault(),
  check_out_date: zDateOrDefault(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
  status: z.string(),
  payment_name: z.string(),
  payment_phone: z.string(),
  payment_email: z.string(),
  contact_name: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  total_price: z.number(),
  order_item: orderRoomProductItemWithProductSchema.nullable().optional(),
});

export const orderRoomProductWithItemsListDto = z
  .object({
    orders: z.array(
      orderRoomProductWithItemsSchema.omit({ user_id: true, hotel_id: true, room_plans_id: true }).extend({
        hotel_name: z.string().optional(),
        room_name: z.string().optional(),
        product_name: z.string().optional(),
      }),
    ),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    orders: data.orders.map((order) => ({
      ...order,
      check_in_date: formatDisplayDate(order.check_in_date, 'YYYY-MM-DD'),
      check_out_date: formatDisplayDate(order.check_out_date, 'YYYY-MM-DD'),
      created_at: formatDisplayDate(order.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(order.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

export type OrderRoomProductItemType = z.infer<typeof orderRoomProductItemSchema>;
export type OrderRoomProductItemCreateType = z.infer<typeof orderRoomProductItemCreateSchema>;
export type productPlansType = z.infer<typeof productPlansSchema>;
export type OrderRoomProductItemWithProduct = z.infer<typeof orderRoomProductItemWithProductSchema>;

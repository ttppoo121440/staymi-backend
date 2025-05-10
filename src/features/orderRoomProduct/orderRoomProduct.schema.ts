import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

const StatusEnum = z.enum(['pending', 'confirmed', 'cancelled']);

export const orderRoomProductSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  room_plans_id: z.string().uuid(),
  check_in_date: zDateOrDefault(),
  check_out_date: zDateOrDefault(),
  total_price: z.number(),
  status: StatusEnum,
  payment_name: z.string({ message: '請輸入付款人姓名' }).max(50),
  payment_phone: z.string({ message: '請輸入付款人電話' }).max(20),
  payment_email: z.string({ message: '請輸入付款人信箱' }).email().max(320),
  contact_name: z.string({ message: '請輸入聯絡人姓名' }).max(50),
  contact_phone: z.string({ message: '請輸入聯絡人電話' }).max(20),
  contact_email: z.string({ message: '請輸入聯絡人信箱' }).email().max(320),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const orderRoomProductListDto = z
  .object({
    orders: z.array(orderRoomProductSchema),
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

export const orderRoomProductDto = z
  .object({
    order: orderRoomProductSchema,
  })
  .transform((data) => ({
    order: {
      ...data.order,
      check_in_date: formatDisplayDate(data.order.check_in_date, 'YYYY-MM-DD'),
      check_out_date: formatDisplayDate(data.order.check_out_date, 'YYYY-MM-DD'),
      created_at: formatDisplayDate(data.order.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.order.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const orderRoomProductCreateSchema = orderRoomProductSchema.omit({
  id: true,
  created_at: true,
});

export type OrderRoomProductType = z.infer<typeof orderRoomProductSchema>;
export type OrderRoomProductCreateType = z.infer<typeof orderRoomProductCreateSchema>;
export type StatusType = z.infer<typeof StatusEnum>;

import { z } from 'zod';

import { paginationSchema, QuerySchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

import { orderRoomProductItemSchema } from '../orderRoomProductItem/orderRoomProductItem.schema';

const StatusEnum = z.enum(['pending', 'confirmed', 'cancelled'], {
  message: '狀態只能是 pending、confirmed、cancelled',
});

export const orderRoomProductSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  user_id: z.string().uuid({ message: '請填正確 id 格式' }),
  hotel_id: z.string().uuid({ message: '請填正確 id 格式' }),
  room_plans_id: z.string().uuid({ message: '請填正確 id 格式' }),
  check_in_date: zDateOrDefault(),
  check_out_date: zDateOrDefault(),
  total_price: z.number().optional(),
  status: StatusEnum,
  payment_name: z.string({ message: '請輸入付款人姓名' }).max(50),
  payment_phone: z.string({ message: '請輸入付款人電話' }).max(20),
  payment_email: z.string({ message: '請輸入付款人信箱' }).email().max(320),
  contact_name: z.string({ message: '請輸入聯絡人姓名' }).max(50),
  contact_phone: z.string({ message: '請輸入聯絡人電話' }).max(20),
  contact_email: z.string({ message: '請輸入聯絡人信箱' }).email().max(320),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
  product_plans_id: z.string().uuid({ message: '請填正確 id 格式' }).optional(),
});

export const orderRoomProductWithItemsSchema = orderRoomProductSchema.extend({
  order_item: orderRoomProductItemSchema
    .omit({ created_at: true, updated_at: true, order_id: true, product_plans_id: true })
    .nullable()
    .optional(),
});

export const orderRoomProductListDto = z
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

export const orderDetailSchema = orderRoomProductSchema
  .omit({
    user_id: true,
    hotel_id: true,
    room_plans_id: true,
  })
  .extend({
    order_item: orderRoomProductItemSchema.omit({ created_at: true, updated_at: true }).nullable().optional(),
    hotel_name: z.string().optional(),
    hotel_region: z.string().optional(),
    hotel_address: z.string().optional(),
    hotel_phone: z.string().optional(),
    room_name: z.string().optional(),
    product_name: z.string().nullable().optional(),
    product_price: z.number().nullable().optional(),
    product_quantity: z.number().nullable().optional(),
  });

export const orderRoomProductDto = z
  .object({
    order: orderDetailSchema,
    order_item: orderRoomProductItemSchema
      .omit({
        order_id: true,
        product_plans_id: true,
        created_at: true,
        updated_at: true,
      })
      .optional(),
  })
  .transform((data) => ({
    order: {
      ...data.order,
      check_in_date: formatDisplayDate(data.order.check_in_date, 'YYYY-MM-DD'),
      check_out_date: formatDisplayDate(data.order.check_out_date, 'YYYY-MM-DD'),
      created_at: formatDisplayDate(data.order.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.order.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
    order_item: data.order_item
      ? {
          ...data.order_item,
        }
      : undefined,
  }));

export const orderRoomProductCreateSchema = orderRoomProductSchema
  .omit({
    id: true,
    status: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    product_plans_id: z.string().uuid({ message: '請填正確 id 格式' }).optional(),
    quantity: z.number().int().min(1, { message: '數量必須大於 0' }).optional(),
  });

export const orderRoomProductUpdateSchema = orderRoomProductSchema
  .pick({
    status: true,
  })
  .extend({
    paypal_transaction_id: z.string().optional(),
  });

export const orderBodySchema = orderRoomProductSchema.pick({
  hotel_id: true,
  room_plans_id: true,
});
export const orderParamsIdSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
});

export const orderQuerySchema = QuerySchema.extend({
  status: StatusEnum.optional(),
});

export type OrderRoomProductWithPaypal = OrderRoomProductType & {
  paypal_transaction_id?: string;
};

export type OrderRoomProductType = z.infer<typeof orderRoomProductSchema>;
export type OrderRoomProductCreateType = z.infer<typeof orderRoomProductCreateSchema>;
export type StatusType = z.infer<typeof StatusEnum>;
export type OrderRoomProductUpdateType = z.infer<typeof orderRoomProductUpdateSchema>;
export type OrderRoomProductDtoType = z.infer<typeof orderRoomProductDto>;
export type orderRoomProductWithItemsType = z.infer<typeof orderRoomProductWithItemsSchema>;
export type orderDetailType = z.infer<typeof orderDetailSchema>;

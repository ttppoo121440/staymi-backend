import { z } from 'zod';

import { formatDisplayDate } from '@/utils/formatDate';

import { orderDetailSchema } from '../orderRoomProduct/orderRoomProduct.schema';
import { orderRoomProductItemSchema } from '../orderRoomProductItem/orderRoomProductItem.schema';

export const paypalSchema = z.object({
  order_type: z.enum(['room', 'subscription'], {
    message: 'order_type 必須是 room 或 subscription',
  }),
  method: z.string({ message: '付款方式必填' }),
});

export const paypalDto = z
  .object({
    payment: orderDetailSchema,
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
    payment: {
      ...data.payment,
      check_in_date: formatDisplayDate(data.payment.check_in_date, 'YYYY-MM-DD'),
      check_out_date: formatDisplayDate(data.payment.check_out_date, 'YYYY-MM-DD'),
      created_at: formatDisplayDate(data.payment.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.payment.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
    order_item: data.order_item
      ? {
          ...data.order_item,
        }
      : undefined,
  }));

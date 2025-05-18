import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//原始欄位
const roomPlanSchema = z.object({
  id: z.string().uuid().optional(),
  hotel_id: z.string({ message: '請填寫飯店 id' }).uuid({ message: '請填正確 id 格式' }),
  hotel_room_id: z.string({ message: '請填寫房間 id' }).uuid({ message: '請填正確 id 格式' }),
  price: z.number({ message: '請填寫售價' }).min(1, '金額不得小於 1'),
  subscription_price: z.number({ message: '請填寫訂閱價優惠價' }).min(1, '金額不得小於 1'),
  images: z.array(z.string()).optional(),
  start_date: z.string({ message: '請填寫計畫開始日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  end_date: z.string({ message: '請填寫計畫結束日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  is_active: z.boolean(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const roomPlanCreateSchema = roomPlanSchema.omit({
  id: true,
  hotel_id: true,
  created_at: true,
  updated_at: true,
});

export const roomPlanUpdateSchema = roomPlanSchema
  .pick({
    hotel_room_id: true,
    price: true,
    subscription_price: true,
    images: true,
    start_date: true,
    end_date: true,
    is_active: true,
  })
  .partial();

export const roomPlanDto = z
  .object({
    roomPlan: roomPlanSchema,
  })
  .transform((data) => ({
    roomPlan: {
      ...data.roomPlan,
      created_at: formatDisplayDate(data.roomPlan.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.roomPlan.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const roomPlanListDto = z
  .object({
    roomPlans: z.array(roomPlanSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    roomPlans: data.roomPlans.map((roomPlan) => ({
      ...roomPlan,
      created_at: formatDisplayDate(roomPlan.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(roomPlan.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

export type RoomPlanType = z.infer<typeof roomPlanSchema>;

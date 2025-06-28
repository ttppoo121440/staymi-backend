import { z } from 'zod';

import { QuerySchema } from '@/types/pagination';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const RoomPlanSearchResultSchema = z.object({
  hotel_id: z.string({ message: '請填寫飯店 id' }).uuid({ message: '請填正確 id 格式' }),
  hotel_name: z.string(),
  hotel_region: z.string(),
  hotel_address: z.string(),
  hotel_phone: z.string(),
  hotel_facilities: z.array(z.string()),
  hotel_policies: z.string(),
  hotel_cover_image: z.string().nullable(),
  transportation: z.string(),
  latitude: z
    .string()
    .regex(/^(-?\d+(\.\d+)?)$/, '經度必須是有效的數字字串')
    .refine((val) => parseFloat(val) >= -90 && parseFloat(val) <= 90, '緯度必須在 -90 到 90 之間'),
  longitude: z
    .string()
    .regex(/^(-?\d+(\.\d+)?)$/, '緯度必須是有效的數字字串')
    .refine((val) => parseFloat(val) >= -180 && parseFloat(val) <= 180, '經度必須在 -180 到 180 之間'),

  room_plan_id: z.string().uuid(),
  subscription_price: z.number({ message: '請填寫訂閱價優惠價' }).min(1, '金額不得小於 1'),
  price: z.number({ message: '請填寫售價' }).min(1, '金額不得小於 1'),
  start_time: z.string({ message: '請填寫計畫開始日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  end_time: z.string({ message: '請填寫計畫結束日期' }).regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' }),
  plan_images: z.array(z.string()).nullable().optional(),

  hotel_room_id: z.string({ message: '請填寫房間 id' }).uuid({ message: '請填正確 id 格式' }),
  hotel_room_description: z.string({ message: '請填寫房間敘述' }),
  hotel_room_images: z.array(z.string()).nullable(),
  base_price: z.number({ message: '請填寫原始金額' }).min(1, '金額不得小於 1'),

  room_type_id: z.string().uuid(),
  room_type_name: z.string({ message: '請輸入飯店房型' }).max(50),
  room_type_description: z.string({ message: '請輸入飯店房型描述' }).max(255),
  room_service: z
    .array(z.string().max(50), { invalid_type_error: '請選擇飯店房型服務' })
    .refine((val) => val.length > 0, { message: '請選擇飯店房型服務' }),

  brand_description: z.string(),
});

export const roomPlanSearchQuerySchema = z
  .object({
    hotel_name: z.string().optional(),
    hotel_region: z.string().optional(),
    start_date: z
      .string({ message: '請填寫計畫開始日期' })
      .regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' })
      .optional(),
    end_date: z
      .string({ message: '請填寫計畫結束日期' })
      .regex(dateRegex, { message: '請使用 YYYY-MM-DD 格式' })
      .optional(),
    room_type_name: z.string({ message: '請輸入飯店房型' }).max(50).optional(),
    sort_by: z.enum(['price', 'name', 'date']).optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
  })
  .merge(QuerySchema);

export type RoomPlanSearchResult = z.infer<typeof RoomPlanSearchResultSchema>;

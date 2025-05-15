import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const roomTypesSchema = z.object({
  id: z.string().uuid(),
  brand_id: z.string().uuid(),
  name: z.string({ message: '請輸入飯店房型' }).max(50),
  description: z.string({ message: '請輸入飯店房型描述' }).max(255),
  room_service: z
    .array(z.string().max(50), { invalid_type_error: '請選擇飯店房型服務' })
    .refine((val) => val.length > 0, { message: '請選擇飯店房型服務' }),

  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const roomTypesListDto = z
  .object({
    roomTypes: z.array(roomTypesSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    roomTypes: data.roomTypes.map((data) => ({
      ...data,
      created_at: formatDisplayDate(data.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

export const roomTypesCreateSchema = roomTypesSchema.omit({
  id: true,
  brand_id: true,
  created_at: true,
  updated_at: true,
});

export const roomTypeDto = z
  .object({
    roomType: roomTypesSchema,
  })
  .transform((data) => ({
    roomType: {
      ...data.roomType,
      created_at: formatDisplayDate(data.roomType.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.roomType.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const roomTypesUpdateSchema = roomTypesSchema.omit({ id: true, brand_id: true, created_at: true });

export const roomTypesDeleteSchema = roomTypesSchema.pick({ id: true, brand_id: true });

export type roomTypes = z.infer<typeof roomTypesSchema>;
export type roomTypesCreateType = z.infer<typeof roomTypesCreateSchema> & { brand_id: string };
export type roomTypesUpdateType = z.infer<typeof roomTypesUpdateSchema> & { id: string; brand_id: string };
export type roomTypesDeleteType = z.infer<typeof roomTypesDeleteSchema>;

import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const hotelGetAllSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  region: z.string().max(50),
  name: z.string({ message: '請輸入店名' }).max(50),
  address: z.string({ message: '請輸入地址' }).max(100),
  phone: z.string({ message: '請輸入電話' }).max(20),
  transportation: z.string().max(255),
  hotel_policies: z.string().max(255),
  latitude: z
    .string()
    .regex(/^(-?\d+(\.\d+)?)$/, '經度必須是有效的數字字串')
    .refine((val) => parseFloat(val) >= -90 && parseFloat(val) <= 90, '緯度必須在 -90 到 90 之間'),
  longitude: z
    .string()
    .regex(/^(-?\d+(\.\d+)?)$/, '緯度必須是有效的數字字串')
    .refine((val) => parseFloat(val) >= -180 && parseFloat(val) <= 180, '經度必須在 -180 到 180 之間'),
  hotel_facilities: z.array(z.string()).max(50),
  is_active: z.boolean(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const hotelGetAllToDTO = z
  .object({
    hotels: z.array(hotelGetAllSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    hotels: data.hotels.map((hotel) => ({
      ...hotel,
      created_at: formatDisplayDate(hotel.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(hotel.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

export const hotelCreateSchema = hotelGetAllSchema.omit({
  created_at: true,
  updated_at: true,
});

export const hotelCreateToDTO = z
  .object({
    hotel: hotelCreateSchema,
  })
  .extend({
    created_at: zDateOrDefault(),
    updated_at: zDateOrDefault(),
  })
  .transform((data) => ({
    hotel: {
      ...data.hotel,
      created_at: formatDisplayDate(data.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const hotelUpdateSchema = hotelCreateSchema
  .extend({
    updated_at: zDateOrDefault(),
  })
  .extend({
    id: z.string().uuid(),
  });

export const hotelUpdateToDTO = z
  .object({
    hotel: hotelUpdateSchema,
  })
  .transform((data) => ({
    hotel: {
      ...data.hotel,
      updated_at: formatDisplayDate(data.hotel.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const hotelQuerySchema = z.object({
  currentPage: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).default(10),
});

export type hotelGetAllType = z.infer<typeof hotelGetAllSchema>;
export type hotelGetAllToDTOType = z.infer<typeof hotelGetAllToDTO>;
export type hotelCreateType = z.infer<typeof hotelCreateSchema>;
export type hotelUpdateType = z.infer<typeof hotelUpdateSchema>;

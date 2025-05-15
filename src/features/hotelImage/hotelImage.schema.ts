import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const hotelImageSchema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  image_url: z.string({ message: '請上傳圖片' }),
  is_cover: z.boolean().default(false),
  position: z.number({ message: '請輸入整數' }).default(0),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const hotelImageListDto = z
  .object({
    images: z.array(hotelImageSchema),
    pagination: paginationSchema,
  })
  .transform((data) => {
    return {
      images: data.images.map((item) => ({
        ...item,
        created_at: formatDisplayDate(item.created_at, 'YYYY-MM-DD HH:mm:ss'),
        updated_at: formatDisplayDate(item.updated_at, 'YYYY-MM-DD HH:mm:ss'),
      })),
      pagination: data.pagination,
    };
  });

export const hotelImageDto = z
  .object({
    image: hotelImageSchema,
  })
  .transform((data) => ({
    image: {
      ...data.image,
      created_at: formatDisplayDate(data.image.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.image.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const hotelImageCreateSchema = hotelImageSchema.omit({
  id: true,
  hotel_id: true,
  created_at: true,
  updated_at: true,
});

export const hotelImageUpdateSchema = hotelImageSchema.omit({
  id: true,
  hotel_id: true,
  created_at: true,
});
export const hotelImageDeleteSchema = hotelImageSchema.pick({
  id: true,
  hotel_id: true,
});

export type HotelImageType = z.infer<typeof hotelImageSchema>;
export type HotelImageCreateType = z.infer<typeof hotelImageCreateSchema> & { hotel_id: string };
export type HotelImageUpdateType = z.infer<typeof hotelImageUpdateSchema> & { id: string; hotel_id: string };
export type HotelImageDeleteType = z.infer<typeof hotelImageDeleteSchema>;

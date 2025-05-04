import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const hotelImagesSchema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  image_url: z.string({ message: '請上傳圖片' }),
  is_cover: z.boolean().default(false),
  position: z.number({ message: '請輸入整數' }).default(0),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

export const hotelImagesListDto = z
  .object({
    images: z.array(hotelImagesSchema),
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

export const hotelImagesDto = z
  .object({
    image: hotelImagesSchema,
  })
  .transform((data) => ({
    image: {
      ...data.image,
      created_at: formatDisplayDate(data.image.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.image.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const hotelImagesCreateSchema = hotelImagesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const hotelImagesUpdateSchema = hotelImagesSchema.omit({
  created_at: true,
});
export const hotelImagesDeleteSchema = hotelImagesSchema.pick({
  id: true,
  hotel_id: true,
});

export type HotelImageType = z.infer<typeof hotelImagesSchema>;
export type HotelImageCreateType = z.infer<typeof hotelImagesCreateSchema>;
export type HotelImageUpdateType = z.infer<typeof hotelImagesUpdateSchema>;
export type HotelImageDeleteType = z.infer<typeof hotelImagesDeleteSchema>;

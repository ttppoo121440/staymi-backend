import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

//原始欄位
const hotelRoomSchema = z.object({
  id: z.string().uuid().optional(),
  hotel_id: z.string({ message: '請填寫飯店 id' }).uuid({ message: '請填正確 id 格式' }),
  room_type_id: z.string({ message: '請填寫房型 id' }).uuid({ message: '請填正確 id 格式' }),
  basePrice: z.number({ message: '請填寫原始金額' }).min(1, '金額不得小於 1'),
  description: z.string({ message: '請填寫房間敘述' }),
  imageUrl: z.string().optional(),
  is_active: z.boolean(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});

//可編輯的欄位
const editableFields = hotelRoomSchema
  .pick({
    room_type_id: true,
    basePrice: true,
    description: true,
    imageUrl: true,
  })
  .partial();

export const hotelRoomCreateSchema = hotelRoomSchema.omit({ id: true, created_at: true, updated_at: true });

export const hotelRoomUpdateSchema = z
  .object({
    id: z.string().uuid({ message: '請填正確 id 格式' }),
    hotel_id: z.string().uuid(),
  })
  .merge(editableFields);

export const hotelRoomUpdateIsActiveSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  hotel_id: z.string().uuid(),
  is_active: z.boolean(),
});

export const hotelRoomDeleteSchema = z.object({
  id: z.string().uuid({ message: '請填正確 id 格式' }),
  hotel_id: z.string().uuid(),
});

export const hotelRoomDto = z
  .object({
    hotelRoom: hotelRoomSchema,
  })
  .transform((data) => ({
    hotelRoom: {
      ...data.hotelRoom,
      created_at: formatDisplayDate(data.hotelRoom.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(data.hotelRoom.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

export const hotelRoomListDto = z
  .object({
    hotelRooms: z.array(hotelRoomSchema),
    pagination: paginationSchema,
  })
  .transform((data) => ({
    hotelRooms: data.hotelRooms.map((hotelRoom) => ({
      ...hotelRoom,
      created_at: formatDisplayDate(hotelRoom.created_at, 'YYYY-MM-DD HH:mm:ss'),
      updated_at: formatDisplayDate(hotelRoom.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    })),
    pagination: data.pagination,
  }));

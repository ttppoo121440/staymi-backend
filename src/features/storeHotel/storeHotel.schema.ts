import { z } from 'zod';

export const hotelCreateSchema = z.object({
  brand_id: z.string().uuid(),
  region: z.string().max(50),
  name: z.string().max(50),
  address: z.string().max(100),
  phone: z.string().max(20),
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
  is_active: z.boolean().default(true),
});

export type hotelCreateType = z.infer<typeof hotelCreateSchema>;

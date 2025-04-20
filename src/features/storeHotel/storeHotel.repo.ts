import { db } from '@/config/database';
import { hotels } from '@/database/schemas/hotels.schema';

import { hotelCreateType } from './storeHotel.schema';
export class StoreHotelRepo {
  async create(data: hotelCreateType): Promise<hotelCreateType> {
    const result = await db.insert(hotels).values(data).returning();
    if (result.length === 0) {
      throw new Error('無法創建酒店');
    }
    return result[0];
  }
}

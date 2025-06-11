import { and, count, eq, ilike, ne, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { hotels } from '@/database/schemas/hotels.schema';
import { product_plans, SelectProductPlan } from '@/database/schemas/product_plans.schema';
import { room_plans, SelectRoomPlan } from '@/database/schemas/room_plans.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { hotelType } from '../storeHotel/storeHotel.schema';
export class HotelSearchRepo extends BaseRepository {
  async getHotelInputSuggestion(hotelName: string): Promise<{ hotels: hotelType[] }> {
    const result = await db
      .select()
      .from(hotels)
      .where(ilike(hotels.name, `%${hotelName}%`))
      .limit(5);
    if (result.length === 0) {
      throw new RepoError('查無相關飯店', HttpStatus.NOT_FOUND);
    }
    return {
      hotels: result,
    };
  }
  async getAllHotelsPlan(
    currentPage = 1,
    perPage = 10,
  ): Promise<{ productPlans: SelectRoomPlan[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<SelectRoomPlan>(
      (limit, offset) => db.select().from(room_plans).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(product_plans);
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      productPlans: data,
      pagination,
    };
  }
}

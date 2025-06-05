import { and, count, eq, ilike, ne, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { brand } from '@/database/schemas/brand.schema';
import { hotels } from '@/database/schemas/hotels.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { hotelCreateType, hotelType, hotelUpdateType, hotelWithBrandType } from './storeHotel.schema';

export class StoreHotelRepo extends BaseRepository {
  async getAll(
    brandId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ hotels: hotelType[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<hotelType>(
      (limit, offset) => db.select().from(hotels).where(eq(hotels.brand_id, brandId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(hotels)
          .where(eq(hotels.brand_id, brandId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      hotels: data,
      pagination,
    };
  }

  async getAllList(
    hotelName = '',
    currentPage = 1,
    perPage = 10,
  ): Promise<{ hotels: hotelWithBrandType[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<hotelWithBrandType>(
      async (limit, offset) => {
        const rows = await db
          .select({
            id: hotels.id,
            brand_id: hotels.brand_id,
            region: hotels.region,
            name: hotels.name,
            address: hotels.address,
            phone: hotels.phone,
            transportation: hotels.transportation,
            latitude: hotels.latitude,
            longitude: hotels.longitude,
            hotel_facilities: hotels.hotel_facilities,
            image_url: hotels.image_url,
            is_active: hotels.is_active,
            created_at: hotels.created_at,
            updated_at: hotels.updated_at,
            brand_title: brand.title,
          })
          .from(hotels)
          .innerJoin(brand, eq(brand.id, hotels.brand_id))
          .where(ilike(hotels.name, `%${hotelName}%`))
          .limit(limit)
          .offset(offset);

        return rows;
      },
      async () => {
        const totalItemsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(hotels);
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      hotels: data,
      pagination,
    };
  }

  async getHotelCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(hotels);
    return Number(result[0]?.count ?? 0);
  }

  async create(data: hotelCreateType): Promise<{ hotel: hotelCreateType }> {
    const result = await db.insert(hotels).values(data).returning();
    if (result.length === 0) {
      throw new RepoError('創建飯店失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      hotel: result[0],
    };
  }
  async update(data: hotelUpdateType): Promise<{ hotel: hotelUpdateType }> {
    const result = await db
      .update(hotels)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(hotels.id, data.id), eq(hotels.brand_id, data.brand_id)))
      .returning();
    if (result.length === 0) {
      throw new RepoError('飯店不存在', HttpStatus.NOT_FOUND);
    }
    return {
      hotel: result[0],
    };
  }

  async getById(conditions: Partial<{ hotelId: string; brandId: string }>): Promise<{ hotel: hotelCreateType } | null> {
    const queryConditions = [];
    if (conditions.hotelId) {
      queryConditions.push(eq(hotels.id, conditions.hotelId));
    }
    if (conditions.brandId) {
      queryConditions.push(eq(hotels.brand_id, conditions.brandId));
    }

    const result = await db
      .select()
      .from(hotels)
      .where(and(...queryConditions));
    if (result.length === 0) {
      throw new RepoError('飯店不存在', HttpStatus.NOT_FOUND);
    }
    return {
      hotel: result[0] ?? null,
    };
  }
  async isNameDuplicate(name: string, idToExclude?: string): Promise<boolean> {
    const conditions = [eq(hotels.name, name)];
    if (idToExclude) {
      conditions.push(ne(hotels.id, idToExclude));
    }

    const result = await db
      .select()
      .from(hotels)
      .where(and(...conditions));
    return result.length > 0;
  }
}

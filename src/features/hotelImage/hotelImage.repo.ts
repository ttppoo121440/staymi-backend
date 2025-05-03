import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { hotel_images } from '@/database/schemas/hotel_images.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { HotelImageCreateType, HotelImageDeleteType, HotelImageType, HotelImageUpdateType } from './hotelImage.schema';

export class HotelImageRepo extends BaseRepository {
  getAll = async (
    hotelId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ images: HotelImageType[]; pagination: PaginationType }> => {
    const { data, pagination } = await this.paginateQuery<HotelImageType>(
      (limit, offset) =>
        db.select().from(hotel_images).where(eq(hotel_images.hotel_id, hotelId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(hotel_images)
          .where(eq(hotel_images.hotel_id, hotelId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      images: data,
      pagination,
    };
  };
  getByHotelId = async (hotelId: string): Promise<{ image: HotelImageType }> => {
    const result = await db.select().from(hotel_images).where(eq(hotel_images.hotel_id, hotelId));
    if (result.length === 0) {
      throw new RepoError('飯店分館圖片不存在', HttpStatus.NOT_FOUND);
    }
    return {
      image: result[0],
    };
  };
  getById = async (hotelImageId: string): Promise<{ image: HotelImageType }> => {
    const result = await db.select().from(hotel_images).where(eq(hotel_images.id, hotelImageId));
    if (result.length === 0) {
      throw new RepoError('飯店分館圖片不存在', HttpStatus.NOT_FOUND);
    }
    return {
      image: result[0],
    };
  };
  create = async (data: HotelImageCreateType): Promise<{ image: HotelImageCreateType }> => {
    const result = await db.insert(hotel_images).values(data).returning();
    if (result.length === 0) {
      throw new RepoError('飯店分館圖片新增失敗');
    }
    return {
      image: result[0],
    };
  };
  update = async (data: HotelImageUpdateType): Promise<{ image: HotelImageUpdateType }> => {
    const result = await db
      .update(hotel_images)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(hotel_images.id, data.id), eq(hotel_images.hotel_id, data.hotel_id)))
      .returning();
    if (result.length === 0) {
      throw new RepoError('飯店分館圖片更新失敗');
    }
    return {
      image: result[0],
    };
  };
  delete = async (data: HotelImageDeleteType): Promise<void> => {
    const result = await db
      .delete(hotel_images)
      .where(and(eq(hotel_images.id, data.id), eq(hotel_images.hotel_id, data.hotel_id)));
    if (result.rowCount === 0) {
      throw new RepoError('查無此資料，刪除失敗', HttpStatus.NOT_FOUND);
    }
  };
}

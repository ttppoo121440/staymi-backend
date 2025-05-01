import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { room_types } from '@/database/schemas/room_types.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { roomTypes, roomTypesCreateType, roomTypesDeleteType, roomTypesUpdateType } from './roomType.schema';

export class RoomTypeRepo extends BaseRepository {
  async getAll(
    brandId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ roomTypes: roomTypes[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<roomTypes>(
      (limit, offset) =>
        db.select().from(room_types).where(eq(room_types.brand_id, brandId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(room_types)
          .where(eq(room_types.brand_id, brandId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      roomTypes: data,
      pagination,
    };
  }
  async getById(conditions: Partial<{ roomTypeId: string; brandId: string }>): Promise<{ roomType: roomTypes } | null> {
    const queryConditions = [];
    if (conditions.roomTypeId) {
      queryConditions.push(eq(room_types.id, conditions.roomTypeId));
    }
    if (conditions.brandId) {
      queryConditions.push(eq(room_types.brand_id, conditions.brandId));
    }
    console.log('debug conditions:', conditions);
    const result = await db
      .select()
      .from(room_types)
      .where(and(...queryConditions))
      .limit(1);
    if (result.length === 0) {
      throw new RepoError('房型不存在', HttpStatus.NOT_FOUND);
    }
    return {
      roomType: result[0] || null,
    };
  }

  async create(data: roomTypesCreateType): Promise<{ roomType: roomTypesCreateType }> {
    const result = await db.insert(room_types).values(data).returning();
    if (result.length === 0) {
      throw new RepoError('創建房型失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      roomType: result[0],
    };
  }
  async update(data: roomTypesUpdateType): Promise<{ roomType: roomTypesUpdateType }> {
    const result = await db
      .update(room_types)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(room_types.id, data.id), eq(room_types.brand_id, data.brand_id)))
      .returning();
    if (result.length === 0) {
      throw new RepoError('房型不存在', HttpStatus.NOT_FOUND);
    }
    return {
      roomType: result[0],
    };
  }
  async delete(data: roomTypesDeleteType): Promise<void> {
    const result = await db
      .delete(room_types)
      .where(and(eq(room_types.id, data.id), eq(room_types.brand_id, data.brand_id)));
    if (result.rowCount === 0) {
      throw new RepoError('查無此資料，刪除失敗', HttpStatus.NOT_FOUND);
    }
  }
}

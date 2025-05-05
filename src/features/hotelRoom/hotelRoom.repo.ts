import { and, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import {
  DeleteHotelRoom,
  hotel_rooms,
  InsertHotelRoom,
  SelectHotelRoom,
  UpdateHotelRoom,
} from '@/database/schemas/hotel_rooms.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

function buildHotelRoomConditions(conditions: Partial<{ hotelRoomId: string; hotelId: string }>): SQL[] {
  const queryConditions: SQL[] = [];
  if (conditions.hotelRoomId) {
    queryConditions.push(eq(hotel_rooms.id, conditions.hotelRoomId));
  }
  if (conditions.hotelId) {
    queryConditions.push(eq(hotel_rooms.hotel_id, conditions.hotelId));
  }
  return queryConditions;
}

export class HotelRoomRepo extends BaseRepository {
  async getAll(
    hotelId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ hotelRooms: SelectHotelRoom[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<SelectHotelRoom>(
      (limit, offset) =>
        db.select().from(hotel_rooms).where(eq(hotel_rooms.hotel_id, hotelId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(hotel_rooms)
          .where(eq(hotel_rooms.hotel_id, hotelId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      hotelRooms: data,
      pagination,
    };
  }

  async getById(
    conditions: Partial<{ hotelRoomId: string; hotelId: string }>,
  ): Promise<{ hotelRoom: SelectHotelRoom } | null> {
    const queryConditions = buildHotelRoomConditions(conditions);

    const result = await db
      .select()
      .from(hotel_rooms)
      .where(and(...queryConditions));
    return {
      hotelRoom: result[0] ?? null,
    };
  }
  async create(data: InsertHotelRoom): Promise<{ hotelRoom: SelectHotelRoom }> {
    const result = await db.insert(hotel_rooms).values(data).returning();
    if (result.length === 0) {
      throw new RepoError('創建房間失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      hotelRoom: result[0],
    };
  }

  async update(data: UpdateHotelRoom): Promise<{ hotelRoom: SelectHotelRoom }> {
    const queryConditions = buildHotelRoomConditions({ hotelRoomId: data.id, hotelId: data.hotel_id });

    const result = await db
      .update(hotel_rooms)
      .set({ ...data, updated_at: new Date() })
      .where(and(...queryConditions))
      .returning();
    if (result.length === 0) {
      throw new RepoError('飯店房間不存在', HttpStatus.NOT_FOUND);
    }
    return {
      hotelRoom: result[0],
    };
  }
  async delete(data: DeleteHotelRoom): Promise<void> {
    const queryConditions = buildHotelRoomConditions({ hotelRoomId: data.id, hotelId: data.hotel_id });

    const result = await db.delete(hotel_rooms).where(and(...queryConditions));
    if (result.rowCount === 0) {
      throw new RepoError('查無此資料，刪除失敗', HttpStatus.NOT_FOUND);
    }
  }
}

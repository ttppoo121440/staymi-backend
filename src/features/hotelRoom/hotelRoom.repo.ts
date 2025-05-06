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
import { PaginationType } from '@/types/pagination';

function buildHotelRoomConditions(conditions: Partial<{ id: string; hotelId: string }>): SQL[] {
  const queryConditions: SQL[] = [];
  if (conditions.id) {
    queryConditions.push(eq(hotel_rooms.id, conditions.id));
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

  async getById(conditions: Partial<{ id: string; hotelId: string }>): Promise<SelectHotelRoom | null> {
    const queryConditions = buildHotelRoomConditions(conditions);

    const result = await db
      .select()
      .from(hotel_rooms)
      .where(and(...queryConditions));
    return result[0] ?? null;
  }

  async create(data: InsertHotelRoom): Promise<SelectHotelRoom | null> {
    const result = await db.insert(hotel_rooms).values(data).returning();
    return result.length > 0 ? result[0] : null;
  }

  async update(data: UpdateHotelRoom): Promise<SelectHotelRoom | null> {
    const queryConditions = buildHotelRoomConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db
      .update(hotel_rooms)
      .set({ ...data, updated_at: new Date() })
      .where(and(...queryConditions))
      .returning();
    return result.length > 0 ? result[0] : null;
  }
  async delete(data: DeleteHotelRoom): Promise<boolean> {
    const queryConditions = buildHotelRoomConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db.delete(hotel_rooms).where(and(...queryConditions));
    return (result.rowCount ?? 0) > 0;
  }
}

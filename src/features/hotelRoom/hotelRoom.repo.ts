import { and, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import {
  DeleteHotelRoom,
  hotel_rooms,
  InsertHotelRoom,
  SelectHotelRoom,
  SelectHotelRoomWithTypeName,
  UpdateHotelRoom,
} from '@/database/schemas/hotel_rooms.schema';
import { room_types } from '@/database/schemas/room_types.schema';
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
  ): Promise<{ hotelRooms: SelectHotelRoomWithTypeName[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<SelectHotelRoomWithTypeName>(
      (limit, offset) =>
        db
          .select({
            id: hotel_rooms.id,
            hotel_id: hotel_rooms.hotel_id,
            room_type_id: hotel_rooms.room_type_id,
            basePrice: hotel_rooms.basePrice,
            description: hotel_rooms.description,
            images: hotel_rooms.images,
            is_active: hotel_rooms.is_active,
            created_at: hotel_rooms.created_at,
            updated_at: hotel_rooms.updated_at,
            room_type_name: room_types.name,
          })
          .from(hotel_rooms)
          .innerJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id))
          .where(eq(hotel_rooms.hotel_id, hotelId))
          .limit(limit)
          .offset(offset),
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

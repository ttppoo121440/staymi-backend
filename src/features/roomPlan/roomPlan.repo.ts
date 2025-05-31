import { and, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { hotel_rooms } from '@/database/schemas/hotel_rooms.schema';
import { hotels } from '@/database/schemas/hotels.schema';
import {
  DeleteRoomPlan,
  InsertRoomPlan,
  room_plans,
  SelectRoomPlan,
  SelectRoomPlanPrice,
  UpdateRoomPlan,
} from '@/database/schemas/room_plans.schema';
import { room_types } from '@/database/schemas/room_types.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { PaginationType } from '@/types/pagination';

import { getRoomPlanDetailByIdType } from './roomPlan.schema';

function buildRoomPlanConditions(conditions: Partial<{ id: string; hotelId: string }>): SQL[] {
  const queryConditions: SQL[] = [];
  if (conditions.id) {
    queryConditions.push(eq(room_plans.id, conditions.id));
  }
  if (conditions.hotelId) {
    queryConditions.push(eq(room_plans.hotel_id, conditions.hotelId));
  }
  return queryConditions;
}

export class RoomPlanRepo extends BaseRepository {
  async getAll(
    hotelId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ roomPlans: SelectRoomPlan[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<SelectRoomPlan>(
      (limit, offset) =>
        db.select().from(room_plans).where(eq(room_plans.hotel_id, hotelId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(room_plans)
          .where(eq(room_plans.hotel_id, hotelId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      roomPlans: data,
      pagination,
    };
  }

  async getById(conditions: Partial<{ id: string; hotelId: string }>): Promise<SelectRoomPlan | null> {
    const queryConditions = buildRoomPlanConditions(conditions);

    const result = await db
      .select()
      .from(room_plans)
      .where(and(...queryConditions));
    return result[0] ?? null;
  }
  async create(data: InsertRoomPlan): Promise<SelectRoomPlan | null> {
    const result = await db.insert(room_plans).values(data).returning();
    return result.length > 0 ? result[0] : null;
  }

  async update(data: UpdateRoomPlan): Promise<SelectRoomPlan | null> {
    const queryConditions = buildRoomPlanConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db
      .update(room_plans)
      .set({ ...data, updated_at: new Date() })
      .where(and(...queryConditions))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(data: DeleteRoomPlan): Promise<boolean> {
    const queryConditions = buildRoomPlanConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db.delete(room_plans).where(and(...queryConditions));
    return (result.rowCount ?? 0) > 0;
  }
  async getPriceById(id: string): Promise<SelectRoomPlanPrice[]> {
    const result = await db
      .select({ subscription_price: room_plans.subscription_price, price: room_plans.price })
      .from(room_plans)
      .where(eq(room_plans.id, id));
    return result;
  }
  async getRoomPlanDetailById(roomPlanId: string): Promise<getRoomPlanDetailByIdType | null> {
    const result = await db
      .select({
        hotel_id: room_plans.hotel_id,
        hotel_name: hotels.name,
        hotel_region: hotels.region,
        hotel_address: hotels.address,
        hotel_phone: hotels.phone,
        hotel_facilities: hotels.hotel_facilities,
        hotel_policies: hotels.hotel_policies,
        hotel_cover_image: hotels.image_url,
        transportation: hotels.transportation,
        latitude: hotels.latitude,
        longitude: hotels.longitude,

        room_plan_id: room_plans.id,
        subscription_price: room_plans.subscription_price,
        price: room_plans.price,
        start_time: room_plans.start_date,
        end_time: room_plans.end_date,
        plan_images: room_plans.images,

        hotel_room_id: hotel_rooms.id,
        hotel_room_description: hotel_rooms.description,
        hotel_room_images: hotel_rooms.images,
        base_price: hotel_rooms.basePrice,

        room_type_id: room_types.id,
        room_type_name: room_types.name,
        room_type_description: room_types.description,
        room_services: room_types.room_service,
      })
      .from(room_plans)
      .innerJoin(hotels, eq(room_plans.hotel_id, hotels.id))
      .innerJoin(hotel_rooms, eq(room_plans.hotel_id, hotel_rooms.hotel_id))
      .innerJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id))
      .where(and(eq(room_plans.id, roomPlanId), eq(room_plans.is_active, true)));
    return result[0] ?? null;
  }
}

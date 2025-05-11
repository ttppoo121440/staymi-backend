import { and, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import {
  DeleteRoomPlan,
  InsertRoomPlan,
  room_plans,
  SelectRoomPlan,
  SelectRoomPlanPrice,
  UpdateRoomPlan,
} from '@/database/schemas/room_plans.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { PaginationType } from '@/types/pagination';

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
}

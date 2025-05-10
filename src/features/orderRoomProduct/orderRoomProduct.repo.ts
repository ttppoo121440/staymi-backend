import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { order_room_product } from '@/database/schemas/order_room_product.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { PaginationType } from '@/types/pagination';

import { OrderRoomProductCreateType, OrderRoomProductType, StatusType } from './orderRoomProduct.schema';

export class OrderRoomProductRepo extends BaseRepository {
  async getAll(
    user_id: string,
    status?: StatusType,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ orders: OrderRoomProductType[]; pagination: PaginationType }> {
    const conditions = [
      eq(order_room_product.user_id, user_id),
      status ? eq(order_room_product.status, status) : sql`TRUE`,
    ];

    const { data, pagination } = await this.paginateQuery<OrderRoomProductType>(
      (limit, offset) =>
        db
          .select()
          .from(order_room_product)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(order_room_product)
          .where(and(...conditions));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      orders: data,
      pagination,
    };
  }
  async create(total_price: number, data: OrderRoomProductCreateType): Promise<{ order: OrderRoomProductType }> {
    const result = await db
      .insert(order_room_product)
      .values({ ...data, total_price })
      .returning();
    return {
      order: result[0],
    };
  }
}

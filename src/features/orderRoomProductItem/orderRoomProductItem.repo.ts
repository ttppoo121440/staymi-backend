import { eq, inArray } from 'drizzle-orm';

import { db } from '@/config/database';
import { order_room_product_item } from '@/database/schemas/order_room_product_item.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { OrderRoomProductItemCreateType, OrderRoomProductItemType } from './orderRoomProductItem.schema';

export class OrderRoomProductItemRepo {
  async getById(id: string): Promise<{ souvenir: OrderRoomProductItemType } | null> {
    const result = await db.select().from(order_room_product_item).where(eq(order_room_product_item.id, id));
    return {
      souvenir: result[0] ?? null,
    };
  }
  async getByOrderId(orderId: string[]): Promise<{ souvenir: OrderRoomProductItemType[] }> {
    const result = await db
      .select()
      .from(order_room_product_item)
      .where(inArray(order_room_product_item.order_id, orderId));
    return {
      souvenir: result,
    };
  }
  async create(
    dbInstance: DatabaseOrTransaction,
    data: OrderRoomProductItemCreateType,
  ): Promise<{ souvenir: OrderRoomProductItemCreateType }> {
    const result = await dbInstance.insert(order_room_product_item).values(data).returning();
    return {
      souvenir: result[0],
    };
  }
}

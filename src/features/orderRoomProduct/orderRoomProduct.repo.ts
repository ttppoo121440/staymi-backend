import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { hotel_rooms } from '@/database/schemas/hotel_rooms.schema';
import { hotels } from '@/database/schemas/hotels.schema';
import { order_room_product } from '@/database/schemas/order_room_product.schema';
import { order_room_product_item } from '@/database/schemas/order_room_product_item.schema';
import { product_plans } from '@/database/schemas/product_plans.schema';
import { products } from '@/database/schemas/products.schema';
import { room_plans } from '@/database/schemas/room_plans.schema';
import { room_types } from '@/database/schemas/room_types.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { DatabaseOrTransaction } from '@/types/databaseType';
import { PaginationType } from '@/types/pagination';

import { ProductsSchema } from '../product/products.schema';
import { roomTypes } from '../roomType/roomType.schema';
import { hotelType } from '../storeHotel/storeHotel.schema';

import {
  orderDetailType,
  OrderRoomProductCreateType,
  OrderRoomProductType,
  OrderRoomProductUpdateType,
  orderRoomProductWithItemsType,
  StatusType,
} from './orderRoomProduct.schema';

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

    const { data, pagination } = await this.paginateQuery<{
      order: orderRoomProductWithItemsType;
      hotel: hotelType['name'] | null;
      room_types: roomTypes['name'] | null;
      product: ProductsSchema['name'] | null;
    }>(
      (limit, offset) =>
        db
          .select({
            order: order_room_product,
            hotel: hotels.name,
            room_types: room_types.name,
            product: products.name,
          })
          .from(order_room_product)
          .leftJoin(hotels, eq(order_room_product.hotel_id, hotels.id)) // 飯店
          .leftJoin(room_plans, eq(order_room_product.room_plans_id, room_plans.id)) // 房型方案
          .leftJoin(hotel_rooms, eq(room_plans.hotel_room_id, hotel_rooms.id)) // 房間
          .leftJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id)) // 房型
          .leftJoin(order_room_product_item, eq(order_room_product_item.order_id, order_room_product.id)) // 商品項目
          .leftJoin(product_plans, eq(order_room_product_item.product_plans_id, product_plans.id)) // 商品方案
          .leftJoin(products, eq(product_plans.product_id, products.id)) // 商品名稱
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

    // 整理回傳資料
    const orders: OrderRoomProductType[] = data.map((row) => ({
      ...row.order,
      hotel_name: row.hotel ?? undefined,
      room_name: row.room_types ?? undefined,
      product_name: row.product ?? undefined,
    }));

    return {
      orders,
      pagination,
    };
  }
  async getById(id: string, user_id: string): Promise<{ order: orderDetailType } | null> {
    const queryConditions = [eq(order_room_product.id, id), eq(order_room_product.user_id, user_id)];
    const result = await db
      .select({
        order: order_room_product,
        hotel: hotels,
        room_types: room_types,
        product: products,
        product_item: order_room_product_item,
      })
      .from(order_room_product)
      .leftJoin(hotels, eq(order_room_product.hotel_id, hotels.id)) // 飯店
      .leftJoin(room_plans, eq(order_room_product.room_plans_id, room_plans.id)) // 房型方案
      .leftJoin(hotel_rooms, eq(room_plans.hotel_room_id, hotel_rooms.id)) // 房間
      .leftJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id)) // 房型
      .leftJoin(order_room_product_item, eq(order_room_product_item.order_id, order_room_product.id)) // 商品項目
      .leftJoin(product_plans, eq(order_room_product_item.product_plans_id, product_plans.id)) // 商品方案
      .leftJoin(products, eq(product_plans.product_id, products.id)) // 商品名稱
      .where(and(...queryConditions))
      .limit(1);

    // 整理回傳資料
    const order: orderDetailType[] = result.map((row) => ({
      ...row.order,
      hotel_name: row.hotel?.name,
      hotel_region: row.hotel?.region,
      hotel_address: row.hotel?.address,
      hotel_phone: row.hotel?.phone,
      room_name: row.room_types?.name,
      product_name: row.product?.name ?? null,
      product_price: row.product?.price ?? null,
      product_quantity: row.product_item?.quantity ?? null,
    }));

    return {
      order: order[0] ?? null,
    };
  }

  async create(
    dbInstance: DatabaseOrTransaction,
    total_price: number,
    data: OrderRoomProductCreateType,
  ): Promise<{
    order: OrderRoomProductType;
  }> {
    const result = await dbInstance
      .insert(order_room_product)
      .values({ ...data, total_price })
      .returning();
    return {
      order: result[0],
    };
  }
  async updateTotalPrice(
    dbInstance: DatabaseOrTransaction,
    orderId: string,
    newTotalPrice: number,
  ): Promise<{ order: OrderRoomProductType[] }> {
    const result = await dbInstance
      .update(order_room_product)
      .set({ total_price: newTotalPrice })
      .where(eq(order_room_product.id, orderId))
      .returning();
    return { order: result };
  }
  async updateStatus(
    id: string,
    user_id: string,
    data: OrderRoomProductUpdateType,
  ): Promise<{ order: OrderRoomProductUpdateType | null }> {
    const queryConditions = [eq(order_room_product.id, id), eq(order_room_product.user_id, user_id)];
    const result = await db
      .update(order_room_product)
      .set({ status: data.status, updated_at: new Date() })
      .where(and(...queryConditions))
      .returning();
    return {
      order: result[0] ?? null,
    };
  }
}

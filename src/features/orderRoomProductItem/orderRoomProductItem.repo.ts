import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { hotels } from '@/database/schemas/hotels.schema';
import { order_room_product_item } from '@/database/schemas/order_room_product_item.schema';
import { product_plans } from '@/database/schemas/product_plans.schema';
import { products } from '@/database/schemas/products.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import {
  OrderRoomProductItemCreateType,
  OrderRoomProductItemType,
  OrderRoomProductItemWithProduct,
  productPlansType,
} from './orderRoomProductItem.schema';

export class OrderRoomProductItemRepo {
  async getById(id: string): Promise<{ souvenir: OrderRoomProductItemType } | null> {
    const result = await db.select().from(order_room_product_item).where(eq(order_room_product_item.id, id));
    return {
      souvenir: result[0] ?? null,
    };
  }
  async getByOrderId(orderId: string[]): Promise<{ souvenir: OrderRoomProductItemWithProduct[] }> {
    const result = await db
      .select({
        id: order_room_product_item.id,
        order_id: order_room_product_item.order_id,
        product_plans_id: order_room_product_item.product_plans_id,
        quantity: order_room_product_item.quantity,
        unit_price: order_room_product_item.unit_price,
        status: order_room_product_item.status,
        products_name: products.name,
        products_imageUrl: products.imageUrl,
        products_description: products.description,
        products_features: products.features,
        product_plans_price: product_plans.price,
        product_plans_start_time: product_plans.start_date,
        product_plans_end_time: product_plans.end_date,
      })
      .from(order_room_product_item)
      .innerJoin(product_plans, eq(order_room_product_item.product_plans_id, product_plans.id))
      .innerJoin(products, eq(product_plans.product_id, products.id))
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
  async getByHotelProduct(hotelId: string): Promise<productPlansType[]> {
    const result = await db
      .select({
        id: product_plans.id,
        price: product_plans.price,
        start_time: product_plans.start_date,
        end_time: product_plans.end_date,
        product_id: products.id,
        product_name: products.name,
        product_features: products.features,
        product_description: products.description,
        product_imageUrl: products.imageUrl,
        product_price: products.price,
      })
      .from(hotels)
      .innerJoin(products, eq(products.hotel_id, hotels.id))
      .innerJoin(product_plans, and(eq(product_plans.product_id, products.id), eq(product_plans.is_active, true)))
      .where(eq(hotels.id, hotelId));
    return result;
  }
  async getByHotelProductItem(hotelId: string, productId: string): Promise<productPlansType | null> {
    const result = await db
      .select({
        id: product_plans.id,
        price: product_plans.price,
        start_time: product_plans.start_date,
        end_time: product_plans.end_date,
        product_id: products.id,
        product_name: products.name,
        product_features: products.features,
        product_description: products.description,
        product_imageUrl: products.imageUrl,
        product_price: products.price,
      })
      .from(hotels)
      .innerJoin(products, eq(products.hotel_id, hotels.id))
      .innerJoin(product_plans, and(eq(product_plans.product_id, products.id), eq(product_plans.is_active, true)))
      .where(and(eq(hotels.id, hotelId), eq(product_plans.id, productId)));
    return result[0] || null;
  }
  async countTotalConfirmedSouvenirSales(): Promise<number> {
    const result = await db
      .select({
        totalQuantitySold: sql`SUM(${order_room_product_item.quantity})`.mapWith(Number),
      })
      .from(order_room_product_item)
      .where(eq(order_room_product_item.status, 'confirmed'));

    return result[0]?.totalQuantitySold || 0;
  }
  async getTopSellingSouvenirProducts(): Promise<{ name: string; totalQuantitySold: number }[]> {
    const result = await db
      .select({
        productPlansId: order_room_product_item.product_plans_id,
        name: products.name,
        totalQuantitySold: sql`SUM(${order_room_product_item.quantity})`,
      })
      .from(order_room_product_item)
      .innerJoin(product_plans, eq(order_room_product_item.product_plans_id, product_plans.id))
      .innerJoin(products, eq(product_plans.product_id, products.id))
      .where(eq(order_room_product_item.status, 'confirmed'))
      .groupBy(order_room_product_item.product_plans_id, products.name)
      .orderBy(desc(sql`SUM(${order_room_product_item.quantity})`))
      .limit(5);

    return result.map((item) => ({
      name: item.name,
      totalQuantitySold: Number(item.totalQuantitySold) || 0,
    }));
  }
}

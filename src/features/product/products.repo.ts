import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { products } from '@/database/schemas/products.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { ProductsCreateType, ProductsSchema, ProductsUpdateType } from './products.schema';

export class ProductsRepo extends BaseRepository {
  async getAll(
    hotelId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ products: ProductsSchema[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<ProductsSchema>(
      (limit, offset) => db.select().from(products).where(eq(products.hotel_id, hotelId)).limit(limit).offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(products)
          .where(eq(products.hotel_id, hotelId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      products: data,
      pagination,
    };
  }
  async getById(id: string, hotelId: string): Promise<{ product: ProductsSchema }> {
    const result = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.hotel_id, hotelId)))
      .limit(1);
    if (result.length === 0) {
      throw new RepoError('查無此伴手禮', HttpStatus.NOT_FOUND);
    }
    return {
      product: result[0],
    };
  }
  async create(data: ProductsCreateType): Promise<{ product: ProductsSchema }> {
    const result = await db.insert(products).values(data).returning();
    if (result.length === 0) {
      throw new RepoError('新增伴手禮失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      product: result[0],
    };
  }
  async update(data: ProductsUpdateType): Promise<{ product: ProductsSchema }> {
    const result = await db
      .update(products)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(products.id, data.id), eq(products.hotel_id, data.hotel_id)))
      .returning();
    if (result.length === 0) {
      throw new RepoError('更新伴手禮失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      product: result[0],
    };
  }
  async softDelete(id: string, hotelId: string, isActive: boolean): Promise<void> {
    const result = await db
      .update(products)
      .set({ is_active: isActive })
      .where(and(eq(products.id, id), eq(products.hotel_id, hotelId)));
    if (result.rowCount === 0) {
      throw new RepoError('刪除伴手禮失敗', HttpStatus.NOT_FOUND);
    }
  }
  async selectIsActive(id: string, hotelId: string): Promise<{ is_active: boolean }> {
    const result = await db
      .select({ is_active: products.is_active })
      .from(products)
      .where(and(eq(products.id, id), eq(products.hotel_id, hotelId)))
      .limit(1);
    if (result.length === 0) {
      throw new RepoError('查無此伴手禮', HttpStatus.NOT_FOUND);
    }
    return {
      is_active: result[0].is_active,
    };
  }
}

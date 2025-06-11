import { and, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import {
  DeleteProductPlan,
  InsertProductPlan,
  product_plans,
  SelectProductPlan,
  UpdateProductPlan,
} from '@/database/schemas/product_plans.schema';
import { products } from '@/database/schemas/products.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { PaginationType } from '@/types/pagination';

import { SelectProductPlanWithJoins } from './productPlan.schema';

function buildProductPlanConditions(conditions: Partial<{ id: string; hotelId: string }>): SQL[] {
  const queryConditions: SQL[] = [];
  if (conditions.id) {
    queryConditions.push(eq(product_plans.id, conditions.id));
  }
  if (conditions.hotelId) {
    queryConditions.push(eq(product_plans.hotel_id, conditions.hotelId));
  }
  return queryConditions;
}

export class ProductPlanRepo extends BaseRepository {
  async getAll(
    hotelId: string,
    currentPage = 1,
    perPage = 10,
  ): Promise<{ productPlans: SelectProductPlanWithJoins[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<SelectProductPlanWithJoins>(
      (limit, offset) =>
        db
          .select({
            id: product_plans.id,
            hotel_id: product_plans.hotel_id,
            product_id: product_plans.product_id,
            price: product_plans.price,
            start_date: product_plans.start_date,
            end_date: product_plans.end_date,
            is_active: product_plans.is_active,
            created_at: product_plans.created_at,
            updated_at: product_plans.updated_at,
            name: products.name,
            product_name: products.name,
            product_imageUrl: products.imageUrl,
          })
          .from(product_plans)
          .innerJoin(products, eq(product_plans.product_id, products.id))
          .where(eq(product_plans.hotel_id, hotelId))
          .limit(limit)
          .offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(product_plans)
          .where(eq(product_plans.hotel_id, hotelId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      productPlans: data,
      pagination,
    };
  }

  async getById(conditions: Partial<{ id: string; hotelId: string }>): Promise<SelectProductPlan | null> {
    const queryConditions = buildProductPlanConditions(conditions);

    const result = await db
      .select()
      .from(product_plans)
      .where(and(...queryConditions));
    return result[0] ?? null;
  }
  async create(data: InsertProductPlan): Promise<SelectProductPlan | null> {
    const result = await db.insert(product_plans).values(data).returning();
    return result.length > 0 ? result[0] : null;
  }

  async update(data: UpdateProductPlan): Promise<SelectProductPlan | null> {
    const queryConditions = buildProductPlanConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db
      .update(product_plans)
      .set({ ...data, updated_at: new Date() })
      .where(and(...queryConditions))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(data: DeleteProductPlan): Promise<boolean> {
    const queryConditions = buildProductPlanConditions({ id: data.id, hotelId: data.hotel_id });

    const result = await db.delete(product_plans).where(and(...queryConditions));
    return (result.rowCount ?? 0) > 0;
  }
}

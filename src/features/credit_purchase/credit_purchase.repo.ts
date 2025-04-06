import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { credit_purchase } from '@/database/schemas/credit_purchase.schema';
import { credit_package } from '@/database/schemas/creditPackage.schema';

import type { Credit_purchaseCreateType } from './credit_purchase.schema';
import { Credit_purchaseCreateSchema, Credit_purchaseResponseSchema } from './credit_purchase.schema';

export class Credit_purchaseRepo {
  async getAll(): Promise<ReturnType<typeof Credit_purchaseResponseSchema.parse>[]> {
    const result = await db.select().from(credit_purchase);
    return result.map((user) => Credit_purchaseResponseSchema.parse(user));
  }
  async create(data: Credit_purchaseCreateType): Promise<ReturnType<typeof Credit_purchaseCreateSchema.parse>> {
    const parsedData = Credit_purchaseCreateSchema.parse(data);
    const packageData = await db.select().from(credit_package).where(eq(credit_package.id, data.credit_package_id));
    if (packageData.length === 0) {
      throw new Error('方案不存在');
    }
    const result = await db.insert(credit_purchase).values(parsedData).returning();
    return Credit_purchaseResponseSchema.parse(result[0]);
  }
}

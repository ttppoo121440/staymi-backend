import { eq } from 'drizzle-orm';

import { credit_package } from '@/database/schemas/creditPackage.schema';
import { isDatabaseError } from '@/utils/isDatabaseError';

import { db } from '../../config/database';

import { insertCredit_packageSchema, selectCredit_packageSchema } from './credit_package.model';
import type { CreditPackageCreateType } from './credit_package.schema';

export class Credit_packageRepo {
  async getAll(): Promise<ReturnType<typeof selectCredit_packageSchema.parse>[]> {
    const result = await db.select().from(credit_package);
    return result.map((pkg) => selectCredit_packageSchema.parse(pkg));
  }

  async create(data: CreditPackageCreateType): Promise<ReturnType<typeof insertCredit_packageSchema.parse>> {
    try {
      const parsedData = insertCredit_packageSchema.parse(data);
      const result = await db.insert(credit_package).values(parsedData).returning();

      if (result.length === 0) {
        throw new Error('Failed to insert credit package');
      }

      return insertCredit_packageSchema.parse(result[0]);
    } catch (error) {
      if (isDatabaseError(error) && error.code === '23505') {
        throw new Error('duplicate key value');
      }
      throw new Error('Invalid input data');
    }
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await db.delete(credit_package).where(eq(credit_package.id, id)).returning();
    return !!result;
  }
}

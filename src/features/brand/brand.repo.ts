import { count, eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { brand } from '@/database/schemas/brand.schema';

export class BrandRepo {
  //獲取品牌信息
  async verifyBrandOwner(brandId: string, userId: string): Promise<boolean> {
    const result = await db.select().from(brand).where(eq(brand.id, brandId)).limit(1);
    return result.length > 0 && result[0].user_id === userId;
  }
  async getBrandCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(brand);
    return result[0]?.count || 0;
  }
}

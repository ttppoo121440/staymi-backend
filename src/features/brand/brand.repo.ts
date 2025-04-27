import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { brand } from '@/database/schemas/brand.schema';

//品牌是否屬於用戶
export const verifyBrandOwner = async (brandId: string, userId: string): Promise<boolean> => {
  const result = await db.select().from(brand).where(eq(brand.id, brandId)).limit(1);

  return result.length > 0 && result[0].user_id === userId;
};

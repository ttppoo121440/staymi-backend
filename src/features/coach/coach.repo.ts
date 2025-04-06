import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { coach } from '@/database/schemas/coach.schema';
import { user } from '@/database/schemas/user.schema';

import type { CoachCreateType } from './coach.schema';
import { CoachResponseSchema, CoachCreate } from './coach.schema';

export class CoachRepo {
  async getAll(per: number, page: number): Promise<ReturnType<typeof CoachResponseSchema.parse>[]> {
    const offset = (page - 1) * per;
    const result = await db.select().from(coach).limit(per).offset(offset);
    return result.map((pkg) => CoachResponseSchema.parse(pkg));
  }
  async getById(id: number): Promise<ReturnType<typeof CoachResponseSchema.parse>> {
    const result = await db.select().from(coach).where(eq(coach.id, id));
    return CoachResponseSchema.parse(result[0]);
  }
  async create(data: CoachCreateType): Promise<ReturnType<typeof CoachCreate.parse>> {
    const parsedData = CoachCreate.parse(data);

    const result = await db.insert(coach).values(parsedData).returning();

    if (result.length === 0) {
      throw new Error('Failed to insert coach');
    }

    const userId = parsedData.user_id;
    await db.update(user).set({ role: 'COACH' }).where(eq(user.id, userId));

    return CoachResponseSchema.parse(result[0]);
  }
}

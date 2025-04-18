import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { AppErrorClass } from '@/utils/appError';

import { user_profileSchema, user_profileType, user_profileUpdateSchema, user_profileUpdateType } from './user.schema';

export class UserRepo {
  async getById(id: string): Promise<user_profileType> {
    const result = await db
      .select({
        id: user.id,
        email: user.email,
        name: user_profile.name,
        phone: user_profile.phone,
        avatar: user_profile.avatar,
        user_id: user_profile.user_id,
        created: user.created_at,
        updated: user_profile.updated_at,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(eq(user.id, id));

    if (result.length === 0) {
      throw new AppErrorClass('用戶不存在', HttpStatus.NOT_FOUND);
    }

    return user_profileSchema.parse(result[0]);
  }
  async update(id: string, data: user_profileUpdateType): Promise<user_profileUpdateType> {
    const validatedData = user_profileUpdateSchema.parse(data);

    await this.ensureUserExists(id); // 確保用戶存在

    if (Object.keys(data).length === 0) {
      throw new Error('更新資料不得為空');
    }
    const result = await db
      .update(user_profile)
      .set({
        name: validatedData.name,
        phone: validatedData.phone,
        birthday: validatedData.birthday,
        avatar: validatedData.avatar,
        gender: validatedData.gender,
      })
      .where(eq(user_profile.user_id, id))
      .returning();

    if (result.length === 0) {
      throw new AppErrorClass('使用者個人資料不存在，無法更新', HttpStatus.NOT_FOUND);
    }

    return user_profileUpdateSchema.parse(result[0]);
  }
  private async ensureUserExists(id: string): Promise<void> {
    const result = await db.select({ userId: user.id }).from(user).where(eq(user.id, id));

    if (result.length === 0) {
      throw new AppErrorClass('用戶不存在', HttpStatus.NOT_FOUND);
    }
  }
}

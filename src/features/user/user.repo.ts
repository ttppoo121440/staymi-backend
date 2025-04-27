import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { RepoError } from '@/utils/appError';

import { user_profileType, user_profileUpdateAvatarType, user_profileUpdateType } from './user.schema';

export class UserRepo {
  async getById(id: string): Promise<{ user: user_profileType }> {
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
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }

    return {
      user: result[0],
    };
  }
  async update(data: user_profileUpdateType): Promise<{ user: user_profileUpdateType }> {
    await this.ensureUserExists(data.id); // 確保用戶存在

    if (Object.keys(data).length === 0) {
      throw new Error('更新資料不得為空');
    }
    const result = await db
      .update(user_profile)
      .set({
        name: data.name,
        phone: data.phone,
        birthday: data.birthday,
        gender: data.gender,
        updated_at: new Date(),
      })
      .where(eq(user_profile.user_id, data.id))
      .returning();

    if (result.length === 0) {
      throw new RepoError('使用者個人資料不存在，無法更新', HttpStatus.NOT_FOUND);
    }

    return {
      user: {
        ...result[0],
      },
    };
  }
  async uploadAvatar(data: user_profileUpdateAvatarType): Promise<{ user: user_profileUpdateAvatarType }> {
    if (!data.avatar) {
      throw new RepoError('請上傳圖片', HttpStatus.BAD_REQUEST);
    }
    const result = await db
      .update(user_profile)
      .set({
        avatar: data.avatar,
        updated_at: new Date(),
      })
      .where(eq(user_profile.user_id, data.id))
      .returning({
        id: user_profile.user_id,
        avatar: user_profile.avatar,
        updated_at: user_profile.updated_at,
      });
    if (result.length === 0) {
      throw new RepoError('使用者個人資料不存在，無法更新', HttpStatus.NOT_FOUND);
    }
    return {
      user: {
        ...result[0],
        avatar: data.avatar,
      },
    };
  }
  private async ensureUserExists(id: string): Promise<void> {
    const result = await db.select({ userId: user.id }).from(user).where(eq(user.id, id));

    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }
  }
}

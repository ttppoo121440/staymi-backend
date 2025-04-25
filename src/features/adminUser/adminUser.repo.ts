import { and, eq, ilike } from 'drizzle-orm';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';
import { PaginatedQuery, paginateQuery } from '@/utils/pagination';

import { Role } from '../auth/auth.schema';

import { adminUserArrayType, adminUserType, adminUserUpdateRoleType } from './adminUser.schema';

export class AdminUserRepo {
  async getAll(
    email = '',
    is_blacklisted?: boolean,
    currentPage = 1,
    perPage = 10,
  ): Promise<{
    users: adminUserArrayType;
    pagination: PaginationType;
  }> {
    const conditions = [];

    if (email) {
      conditions.push(ilike(user.email, `%${email}%`));
    }
    if (typeof is_blacklisted === 'boolean') {
      conditions.push(eq(user.is_blacklisted, is_blacklisted));
    }

    const query = db
      .select({
        id: user.id,
        name: user_profile.name,
        email: user.email,
        phone: user_profile.phone,
        birthday: user_profile.birthday,
        gender: user_profile.gender,
        avatar: user_profile.avatar,
        role: user.role,
        is_blacklisted: user.is_blacklisted,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(and(...conditions));

    // 使用 paginateQuery 處理分頁
    const { data, pagination } = await paginateQuery<adminUserArrayType>(
      query as unknown as PaginatedQuery<adminUserArrayType>,
      currentPage,
      perPage,
    );

    return {
      users: data as unknown as adminUserArrayType,
      pagination,
    };
  }
  async getById(id: string): Promise<{ user: adminUserType }> {
    const userData = await db
      .select({
        id: user.id,
        name: user_profile.name,
        email: user.email,
        phone: user_profile.phone,
        birthday: user_profile.birthday,
        gender: user_profile.gender,
        avatar: user_profile.avatar,
        role: user.role,
        is_blacklisted: user.is_blacklisted,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(eq(user.id, id))
      .limit(1)
      .execute();

    if (userData.length === 0) {
      throw new RepoError('查無此使用者', HttpStatus.NOT_FOUND);
    }
    return {
      user: {
        ...userData[0],
      },
    };
  }
  async updateRole(data: adminUserUpdateRoleType): Promise<{ user: adminUserUpdateRoleType }> {
    const userData = await db
      .update(user)
      .set({ role: data.role as Role, updated_at: new Date() })
      .where(eq(user.id, data.id))
      .returning({ id: user.id, role: user.role, updated_at: user.updated_at })
      .execute();

    if (userData.length === 0) {
      throw new RepoError('查無此使用者', HttpStatus.NOT_FOUND);
    }
    return { user: userData[0] };
  }
}

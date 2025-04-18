import { and, eq, ilike } from 'drizzle-orm';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { AppErrorClass } from '@/utils/appError';
import { PaginatedQuery, paginateQuery } from '@/utils/pagination';

import { Role } from '../auth/auth.schema';

import { adminUserArraySchema, adminUserArrayType, adminUserSchema, adminUserType } from './adminUser.schema';

export class AdminUserRepo {
  async getAll(
    email = '',
    is_blacklisted?: boolean,
    currentPage = 1,
    perPage = 10,
  ): Promise<{
    users: adminUserArrayType;
    pagination: {
      currentPage: number;
      perPage: number;
      totalPages: number;
      totalItems: number;
    };
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
        createdAt: user.created_at,
        updatedAt: user.updated_at,
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
      users: adminUserArraySchema.parse(data),
      pagination,
    };
  }
  async getById(id: string): Promise<{ users: adminUserType }> {
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
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(eq(user.id, id))
      .limit(1)
      .execute();

    if (userData.length === 0) {
      throw new AppErrorClass('查無此使用者', HttpStatus.NOT_FOUND);
    }
    return { users: adminUserSchema.parse(userData[0]) };
  }
  async updateRole(id: string, role: Role): Promise<{ user: { id: string; role: Role } }> {
    const userData = await db
      .update(user)
      .set({ role: role as Role })
      .where(eq(user.id, id))
      .returning()
      .execute();

    if (userData.length === 0) {
      throw new AppErrorClass('查無此使用者', HttpStatus.NOT_FOUND);
    }
    return { user: { id, role: userData[0].role as Role } };
  }
}

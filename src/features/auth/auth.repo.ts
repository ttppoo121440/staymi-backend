import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { RepoError } from '@/utils/appError';
import { generateToken } from '@/utils/jwt';
import { comparePassword, hashPassword } from '@/utils/passwordUtils';

import type { AuthCreateType, AuthLoginType, AuthUpdatePasswordType, Role } from './auth.schema';

export class AuthRepo {
  async login(data: AuthLoginType): Promise<string> {
    const result = await db.select().from(user).where(eq(user.email, data.email));

    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }

    const foundUser = result[0];

    const isPasswordValid = await comparePassword(data.password, foundUser.password);

    if (!isPasswordValid) {
      throw new RepoError('密碼錯誤', HttpStatus.UNAUTHORIZED);
    }

    if (!process.env.JWT_SECRET) {
      throw new RepoError('JWT_SECRET 環境變數未設置', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const userToken = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    });

    return userToken;
  }
  async signup(data: AuthCreateType): Promise<AuthCreateType> {
    const hashedPassword = await hashPassword(data.password);

    const existingUser = await this.checkEmail(data.email);

    if (existingUser) {
      throw new RepoError('信箱已被註冊', HttpStatus.CONFLICT);
    }
    const result = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(user)
        .values({
          email: data.email,
          password: hashedPassword,
          provider: data.provider ?? null,
          provider_id: data.provider_id ?? null,
          role: 'consumer' as Role,
        })
        .returning({ id: user.id });

      if (!insertedUser.id) {
        throw new RepoError('建立用戶失敗', HttpStatus.SERVICE_UNAVAILABLE);
      }

      await tx.insert(user_profile).values({
        user_id: insertedUser.id,
        name: data.name,
        phone: data.phone,
        birthday: data.birthday,
        gender: data.gender,
        avatar: data.avatar ?? null,
      });

      return {
        id: insertedUser.id,
        ...data,
      };
    });

    if (!result.id) {
      throw new RepoError('註冊失敗，請稍後再試', HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
  async checkEmail(email: string): Promise<boolean> {
    const result = await db.select().from(user).where(eq(user.email, email));
    return result.length > 0;
  }
  async getUserByEmail(email: string): Promise<{ name: string; avatar: string }> {
    const result = await db
      .select({
        name: user_profile.name,
        avatar: user_profile.avatar,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(eq(user.email, email));

    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }

    return {
      name: result[0].name,
      avatar: result[0].avatar ?? '',
    };
  }
  async changePassword(data: AuthUpdatePasswordType): Promise<void> {
    const result = await db.select().from(user).where(eq(user.id, data.id));
    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }
    const foundUser = result[0];
    if (!foundUser.password) {
      throw new RepoError('用戶密碼不存在，無法更改密碼', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await comparePassword(data.oldPassword, foundUser.password);
    if (!isPasswordValid) {
      throw new RepoError('舊密碼錯誤', HttpStatus.UNAUTHORIZED);
    }
    const isSamePassword = await comparePassword(data.newPassword, foundUser.password);
    if (isSamePassword) {
      throw new RepoError('新密碼不能與舊密碼相同', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await hashPassword(data.newPassword);
    await db
      .update(user)
      .set({
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(user.id, data.id))
      .execute();
    return;
  }
}

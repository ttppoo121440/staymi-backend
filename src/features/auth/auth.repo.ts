import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { RepoError } from '@/utils/appError';
import { generateToken } from '@/utils/jwt';
import { comparePassword, hashPassword } from '@/utils/passwordUtils';

import type { AuthCreateType, AuthLoginType, Role } from './auth.schema';
import { AuthCreateSchema, AuthLoginSchema, AuthUpdatePasswordSchema } from './auth.schema';

export class AuthRepo {
  async login(data: AuthLoginType): Promise<string> {
    const validatedData = AuthLoginSchema.parse(data);
    const result = await db.select().from(user).where(eq(user.email, validatedData.email));

    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }

    const foundUser = result[0];

    const isPasswordValid = await comparePassword(validatedData.password, foundUser.password);

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
    const validatedData = AuthCreateSchema.parse(data);
    const hashedPassword = await hashPassword(data.password);

    const existingUser = await this.checkEmail(validatedData.email);

    if (existingUser) {
      throw new RepoError('信箱已被註冊', HttpStatus.CONFLICT);
    }
    try {
      const result = await db.transaction(async (tx) => {
        const [insertedUser] = await tx
          .insert(user)
          .values({
            email: validatedData.email,
            password: hashedPassword,
            provider: validatedData.provider ?? null,
            provider_id: validatedData.provider_id ?? null,
            role: 'consumer' as Role,
          })
          .returning({ id: user.id });

        await tx.insert(user_profile).values({
          user_id: insertedUser.id,
          name: validatedData.name,
          phone: validatedData.phone,
          birthday: validatedData.birthday,
          gender: validatedData.gender,
          avatar: validatedData.avatar ?? null,
        });

        return {
          id: insertedUser.id,
          ...validatedData,
        };
      });
      return result;
    } catch (error) {
      console.error('註冊失敗:', error);
      if (error instanceof ZodError) {
        throw error;
      }

      throw new RepoError('註冊失敗，請稍後再試', HttpStatus.SERVICE_UNAVAILABLE);
    }
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
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const validatedData = AuthUpdatePasswordSchema.parse({
      oldPassword,
      newPassword,
    });
    const result = await db.select().from(user).where(eq(user.id, userId));
    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }
    const foundUser = result[0];
    if (!foundUser.password) {
      throw new RepoError('用戶密碼不存在，無法更改密碼', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await comparePassword(validatedData.oldPassword, foundUser.password);
    if (!isPasswordValid) {
      throw new RepoError('舊密碼錯誤', HttpStatus.UNAUTHORIZED);
    }
    const isSamePassword = await comparePassword(validatedData.newPassword, foundUser.password);
    if (isSamePassword) {
      throw new RepoError('新密碼不能與舊密碼相同', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await hashPassword(validatedData.newPassword);
    await db
      .update(user)
      .set({
        password: hashedPassword,
      })
      .where(eq(user.id, userId))
      .execute();
    return;
  }
}

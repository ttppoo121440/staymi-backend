import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';

import type { AuthCreateType, AuthLoginType } from './auth.schema';
import { AuthCreateSchema } from './auth.schema';

export class AuthRepo {
  async login(data: AuthLoginType): Promise<string> {
    const result = await db.select().from(user).where(eq(user.email, data.email));

    if (result.length === 0) {
      throw new Error('用戶不存在');
    }

    const foundUser = result[0];

    const isPasswordValid = await bcrypt.compare(data.password, foundUser.password);

    if (!isPasswordValid) {
      throw new Error('密碼錯誤');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('環境變數中未定義 JWT_SECRET');
    }

    const token = jwt.sign({ id: foundUser.id, email: foundUser.email }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    return token;
  }
  async signup(data: AuthCreateType): Promise<ReturnType<typeof AuthCreateSchema.parse>> {
    const parsedData = AuthCreateSchema.parse(data);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existingUser = await this.checkEmail(parsedData.email);

    if (existingUser) {
      throw new Error('信箱已被註冊');
    }

    const result = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(user)
        .values({
          email: parsedData.email,
          password: hashedPassword,
          provider: parsedData.provider ?? null,
          provider_id: parsedData.provider_id ?? null,
          role: 'consumer' as const,
        })
        .returning({ id: user.id });

      await tx.insert(user_profile).values({
        user_id: insertedUser.id,
        name: parsedData.name,
        phone: parsedData.phone,
        birthday: parsedData.birthday ? new Date(parsedData.birthday) : null,
        gender: parsedData.gender,
        avatar: parsedData.avatar ?? null,
      });

      return {
        id: insertedUser.id,
        ...parsedData,
      };
    });
    return result;
  }
  async checkEmail(email: string): Promise<boolean> {
    const result = await db.select().from(user).where(eq(user.email, email));
    return result.length > 0;
  }
  async getUserByEmail(email: string): Promise<null | { name: string; avatar: string }> {
    const result = await db
      .select({
        name: user_profile.name,
        avatar: user_profile.avatar,
      })
      .from(user)
      .innerJoin(user_profile, eq(user.id, user_profile.user_id))
      .where(eq(user.email, email));

    if (result.length === 0) {
      return null;
    }

    return {
      name: result[0].name,
      avatar: result[0].avatar ?? '',
    };
  }
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const result = await db.select().from(user).where(eq(user.id, userId));
    if (result.length === 0) {
      throw new Error('用戶不存在');
    }
    const foundUser = result[0];
    if (!foundUser.password) {
      throw new Error('用戶密碼不存在，無法更改密碼');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, foundUser.password);
    if (!isPasswordValid) {
      throw new Error('舊密碼錯誤');
    }
    const isSamePassword = await bcrypt.compare(newPassword, foundUser.password);
    if (isSamePassword) {
      throw new Error('新密碼不能與舊密碼相同');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

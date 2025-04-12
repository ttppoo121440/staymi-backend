import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';

import type { UserCreateType } from './user.schema';
import { UserCreateSchema, UserResponseSchema } from './user.schema';

export class userRepo {
  async getAll(): Promise<ReturnType<typeof UserResponseSchema.parse>[]> {
    const result = await db.select().from(user);
    return result.map((user) => UserResponseSchema.parse(user));
  }
  async create(data: UserCreateType): Promise<ReturnType<typeof UserCreateSchema.parse>> {
    const parsedData = UserCreateSchema.parse(data);
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);
    const result = await db
      .insert(user)
      .values({ ...parsedData, password: hashedPassword })
      .returning();
    return UserResponseSchema.parse(result[0]);
  }
  async login(email: string, password: string): Promise<string> {
    const result = await db.select().from(user).where(eq(user.email, email));

    if (result.length === 0) {
      throw new Error('使用者不存在');
    }
    const foundUser = result[0];

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new Error('密碼錯誤');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ id: foundUser.id, email: foundUser.email, role: foundUser.role }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    return token;
  }

  async getById(userId: string): Promise<ReturnType<typeof UserResponseSchema.parse>> {
    const result = await db.select().from(user).where(eq(user.id, userId));
    if (result.length === 0) {
      throw new Error('使用者不存在');
    }
    return UserResponseSchema.parse(result[0]);
  }
}

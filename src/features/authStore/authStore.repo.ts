import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { brand } from '@/database/schemas/brand.schema';
import { user } from '@/database/schemas/user.schema';
import { user_brand } from '@/database/schemas/user_brand.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { RepoError } from '@/utils/appError';
import { generateToken } from '@/utils/jwt';
import { comparePassword, hashPassword } from '@/utils/passwordUtils';

import { AuthLoginType, Role } from '../auth/auth.schema';

import { AuthStoreSignupType, AuthStoreUpdateType, authStoreUploadLogoType } from './authStore.schema';

export class AuthStoreRepo {
  async signup(data: AuthStoreSignupType): Promise<AuthStoreSignupType> {
    const hashedPassword = await hashPassword(data.password);

    const existingUser = await this.checkEmail(data.email);

    if (existingUser) {
      throw new RepoError('信箱已被註冊', HttpStatus.CONFLICT);
    }
    const result = await db.transaction(async (tx) => {
      const [insertedStore] = await tx
        .insert(user)
        .values({
          email: data.email,
          password: hashedPassword,
          role: 'store' as Role,
        })
        .returning({ id: user.id });

      const [insertedBrand] = await tx
        .insert(brand)
        .values({
          user_id: insertedStore.id,
          title: data.title,
          description: data.description,
        })
        .returning({ id: brand.id });

      await tx.insert(user_profile).values({
        user_id: insertedStore.id,
        name: data.name,
        phone: data.phone,
        birthday: data.birthday,
        gender: data.gender,
      });

      await tx.insert(user_brand).values({
        user_id: insertedStore.id,
        brand_id: insertedBrand.id,
      });

      return {
        id: insertedStore.id,
        brand_id: insertedBrand.id,
        ...data,
      };
    });
    return result;
  }
  async storeLogin(data: AuthLoginType): Promise<string> {
    const result = await db.select().from(user).where(eq(user.email, data.email));

    if (result.length === 0) {
      throw new RepoError('用戶不存在', HttpStatus.NOT_FOUND);
    }

    const foundUser = result[0];
    const brand_idResult = await db.select().from(user_brand).where(eq(user_brand.user_id, result[0].id));

    if (foundUser.password === null) {
      throw new RepoError('密碼不存在', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(data.password, foundUser.password);

    if (!isPasswordValid) {
      throw new RepoError('密碼錯誤', HttpStatus.UNAUTHORIZED);
    }

    if (!process.env.JWT_SECRET) {
      throw new RepoError('JWT_SECRET 環境變數未設置', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const userToken = generateToken({
      id: foundUser.id,
      role: foundUser.role,
      brand_id: brand_idResult[0].brand_id,
    });

    return userToken;
  }
  async checkEmail(email: string): Promise<boolean> {
    const result = await db.select().from(user).where(eq(user.email, email));
    return result.length > 0;
  }

  async updateStoreInfo(user_id: string, data: AuthStoreUpdateType): Promise<{ store: AuthStoreUpdateType }> {
    const result = await db.transaction(async (tx) => {
      // 更新 brand 資料
      const updatedBrandResult = await tx
        .update(brand)
        .set({ ...data })
        .where(eq(brand.user_id, user_id))
        .returning({ id: brand.id, title: brand.title, description: brand.description, logo_url: brand.logo_url });

      // 更新 user_profile 資料
      const updatedProfileResult = await tx
        .update(user_profile)
        .set({
          name: data.name,
          phone: data.phone,
          birthday: data.birthday,
          gender: data.gender,
          updated_at: new Date(),
        })
        .where(eq(user_profile.user_id, user_id))
        .returning({
          name: user_profile.name,
          phone: user_profile.phone,
          birthday: user_profile.birthday,
          gender: user_profile.gender,
          updated_at: user_profile.updated_at,
        });

      // 檢查是否有任何一個更新操作沒有找到對應記錄
      if (updatedBrandResult.length === 0 || updatedProfileResult.length === 0) {
        throw new RepoError('找不到對應的商店資訊', HttpStatus.NOT_FOUND);
      }

      const [updatedBrand] = updatedBrandResult;
      const [updatedProfile] = updatedProfileResult;

      return {
        store: {
          ...updatedBrand,
          ...updatedProfile,
        } as AuthStoreUpdateType,
      };
    });

    return result;
  }
  async uploadLogo(id: string, data: authStoreUploadLogoType): Promise<{ store: authStoreUploadLogoType }> {
    const result = await db.update(brand).set({ logo_url: data.logo_url }).where(eq(brand.user_id, id)).returning();

    if (result.length === 0) {
      throw new RepoError('找不到對應的商店資訊', HttpStatus.NOT_FOUND);
    }

    return {
      store: { logo_url: result[0].logo_url ?? '' },
    };
  }
}

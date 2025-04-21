import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';
import logger from '@/utils/logger';

import { AuthRepo } from '../auth/auth.repo';
import { AuthLoginSchema } from '../auth/auth.schema';

import { AuthStoreRepo } from './authStore.repo';
import { authStoreSignupSchema, authStoreUpdateSchema, authStoreUploadLogoSchema } from './authStore.schema';

export class AuthStoreController {
  constructor(private authStoreRepo = new AuthStoreRepo(), private authRepo = new AuthRepo()) {}
  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = authStoreSignupSchema.parse(req.body);
      const newStore = await this.authStoreRepo.signup(validatedData);
      const token = await this.authStoreRepo.storeLogin({ email: newStore.email, password: validatedData.password });
      const userInfo = await this.authRepo.getUserByEmail(newStore.email);
      const responseData = {
        token,
        user: {
          name: userInfo.name,
          avatar: userInfo.avatar,
        },
      };
      res.status(HttpStatus.CREATED).json(successResponse(responseData, '註冊成功'));
    } catch (error) {
      logger.error('註冊失敗:', error);
      next(error);
    }
  }
  async storeLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = AuthLoginSchema.parse(req.body);
      const token = await this.authStoreRepo.storeLogin(validatedData);
      const userInfo = await this.authRepo.getUserByEmail(validatedData.email);
      const responseData = {
        token,
        user: {
          name: userInfo.name,
          avatar: userInfo.avatar,
        },
      };
      res.status(HttpStatus.OK).json(successResponse(responseData, '登入成功'));
    } catch (error) {
      logger.error('登入失敗:', error);
      next(error);
    }
  }
  async updateStoreInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = authStoreUpdateSchema.parse(req.body);
      const userId: string = (req.user as JwtUserPayload).id;
      const brandId: string = (req.user as JwtUserPayload).brand_id ?? '';

      console.log('brandId---------------------------:', brandId);

      const updatedUser = await this.authStoreRepo.updateStoreInfo(userId, validatedData);
      res.status(HttpStatus.OK).json(successResponse(updatedUser, '更新成功'));
    } catch (error) {
      logger.error('更新失敗:', error);
      next(error);
    }
  }
  async uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('uploadLogo-controller');

    try {
      const userId: string = (req.user as JwtUserPayload).id;
      const validatedData = authStoreUploadLogoSchema.parse(req.body);
      const updatedUser = await this.authStoreRepo.uploadLogo(userId, validatedData.logo_url);
      res.status(HttpStatus.OK).json(successResponse(updatedUser, '上傳成功'));
    } catch (error) {
      logger.error('上傳失敗:', error);
      next(error);
    }
  }
}

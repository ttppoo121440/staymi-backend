import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';
import logger from '@/utils/logger';

import { AuthRepo } from '../auth/auth.repo';

import { AuthStoreRepo } from './authStore.repo';

export class AuthStoreController {
  constructor(private authStoreRepo = new AuthStoreRepo(), private authRepo = new AuthRepo()) {}
  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const newUser = await this.authStoreRepo.signup(userData);
      const token = await this.authRepo.login({ email: newUser.email, password: userData.password });
      const userInfo = await this.authRepo.getUserByEmail(newUser.email);
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
  async updateStoreInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const userId: string = (req.user as JwtUserPayload).id;
      const updatedUser = await this.authStoreRepo.updateStoreInfo(userId, userData);
      res.status(HttpStatus.OK).json(successResponse(updatedUser, '更新成功'));
    } catch (error) {
      logger.error('更新失敗:', error);
      next(error);
    }
  }
}

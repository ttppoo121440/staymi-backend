import type { Request, Response, NextFunction } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import logger from '@/utils/logger';

import { AuthRepo } from './auth.repo';

export class AuthController {
  private authRepo = new AuthRepo();

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return appError('請輸入信箱與密碼', next, HttpStatus.BAD_REQUEST);
      }

      const token = await this.authRepo.login({ email, password });
      const userInfo = await this.authRepo.getUserByEmail(email);

      if (!userInfo) {
        return appError('無法獲取用戶資訊', next, HttpStatus.NOT_FOUND);
      }

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

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const newUser = await this.authRepo.signup(userData);
      res.status(HttpStatus.CREATED).json(successResponse(newUser, '註冊成功'));
    } catch (error) {
      logger.error('註冊失敗:', error);
      next(error);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return appError('請提供舊密碼和新密碼', next, HttpStatus.BAD_REQUEST);
      }

      const userId: string = (req.user as JwtUserPayload).id;
      if (!userId) {
        return appError('用戶不存在', next, HttpStatus.NOT_FOUND);
      }

      await this.authRepo.changePassword(userId, oldPassword, newPassword);
      res.status(HttpStatus.OK).json(successResponse(null, '密碼已更新'));
    } catch (error) {
      logger.error('更改密碼失敗:', error);
      next(error);
    }
  }
}

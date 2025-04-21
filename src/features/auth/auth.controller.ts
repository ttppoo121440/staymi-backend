import type { Request, Response, NextFunction } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import logger from '@/utils/logger';

import { AuthRepo } from './auth.repo';
import { AuthCreateSchema, AuthLoginSchema, AuthUpdatePasswordSchema } from './auth.schema';

export class AuthController {
  constructor(private authRepo = new AuthRepo()) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = AuthLoginSchema.parse(req.body);

      if (!validatedData.email || !validatedData.password) {
        next(appError('請輸入信箱與密碼', HttpStatus.BAD_REQUEST));
      }

      const token = await this.authRepo.login(validatedData);
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

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = AuthCreateSchema.parse(req.body);
      const newUser = await this.authRepo.signup(validatedData);
      const token = await this.authRepo.login({ email: newUser.email, password: validatedData.password });
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
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = AuthUpdatePasswordSchema.parse(req.body);

      if (!validatedData.oldPassword || !validatedData.newPassword) {
        next(appError('請提供舊密碼和新密碼', HttpStatus.BAD_REQUEST));
      }

      const userId: string = (req.user as JwtUserPayload).id;
      if (!userId) {
        next(appError('用戶不存在', HttpStatus.NOT_FOUND));
      }

      await this.authRepo.changePassword(userId, validatedData);
      res.status(HttpStatus.OK).json(successResponse(null, '密碼已更新'));
    } catch (error) {
      logger.error('更改密碼失敗:', error);
      next(error);
    }
  }
}

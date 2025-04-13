import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

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

      if (error instanceof Error && error.message === '密碼錯誤') {
        return appError('密碼錯誤，請重新檢查', next, HttpStatus.UNAUTHORIZED);
      } else if (error instanceof Error && error.message === '用戶不存在') {
        return appError('用戶不存在', next, HttpStatus.NOT_FOUND);
      }

      return appError('伺服器發生錯誤，請稍後再試', next, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const newUser = await this.authRepo.signup(userData);
      res.status(HttpStatus.CREATED).json(successResponse(newUser, '註冊成功'));
    } catch (error) {
      logger.error('註冊失敗:', error);

      if (error instanceof ZodError) {
        // 提取第一個欄位的第一條錯誤訊息
        const firstErrorMessage = error.errors[0]?.message;

        if (firstErrorMessage) {
          return appError(firstErrorMessage, next, HttpStatus.BAD_REQUEST);
        }
        return appError('無效的輸入資料', next, HttpStatus.BAD_REQUEST);
      }

      if (error instanceof Error && error.message === '信箱已被註冊') {
        return appError('信箱已被註冊', next, HttpStatus.CONFLICT);
      }

      logger.error('註冊失敗:', error);
      return appError('伺服器發生錯誤，請稍後再試', next, HttpStatus.INTERNAL_SERVER_ERROR);
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

      if (error instanceof Error && error.message === '用戶不存在') {
        return appError('用戶不存在', next, HttpStatus.NOT_FOUND);
      } else if (error instanceof Error && error.message === '舊密碼錯誤') {
        return appError('舊密碼錯誤，請重新檢查', next, HttpStatus.UNAUTHORIZED);
      } else if (error instanceof Error && error.message === '新密碼不能與舊密碼相同') {
        return appError('新密碼不能與舊密碼相同', next, HttpStatus.BAD_REQUEST);
      }

      return appError('伺服器發生錯誤，請稍後再試', next, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

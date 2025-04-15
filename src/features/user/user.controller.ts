import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { UserRepo } from './user.repo';

export class UserController {
  private userRepo = new UserRepo();
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = (req.user as JwtUserPayload).id;
      const userProfile = await this.userRepo.getById(userId);
      res.status(HttpStatus.OK).json(successResponse({ user: { ...userProfile } }, '獲取個人資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      if (error instanceof Error && error.message === '用戶不存在') {
        return appError('使用者不存在', next, HttpStatus.NOT_FOUND);
      }

      return appError('伺服器發生錯誤，請稍後再試', next, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = (req.user as JwtUserPayload).id;
      const data = req.body;
      const updatedUserProfile = await this.userRepo.update(userId, data);
      res.status(HttpStatus.OK).json(successResponse({ user: { ...updatedUserProfile } }, '更新個人資料成功'));
    } catch (error) {
      console.error('更新用戶資料失敗:', error);
      // 確保錯誤是Error實例
      if (error instanceof Error) {
        // Zod 驗證錯誤處理
        if (error instanceof ZodError) {
          const errorMessages = error.errors.map((err) => err.message).join(', ');
          return appError(errorMessages || '資料格式錯誤', next, HttpStatus.BAD_REQUEST);
        }
        // 根據錯誤訊息分類處理
        switch (error.message) {
          case '用戶不存在':
            return appError('使用者不存在', next, HttpStatus.NOT_FOUND);
          case '更新資料不得為空':
            return appError('更新資料不得為空', next, HttpStatus.BAD_REQUEST);
          case '使用者個人資料不存在，無法更新':
            return appError('更新個人資料失敗', next, HttpStatus.BAD_REQUEST);
          case error.message.includes('toISOString') && error.message:
            return appError('日期格式不正確', next, HttpStatus.BAD_REQUEST);
          default:
            return appError('更新個人資料失敗', next, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      return appError('更新個人資料失敗', next, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

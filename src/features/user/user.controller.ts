import type { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
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
      next(error);
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
      next(error);
    }
  }
}

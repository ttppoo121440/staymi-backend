import type { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';

import { UserRepo } from './user.repo';
import { user_profileToDTO, user_profileUpdateSchema, user_profileUpdateToDTO } from './user.schema';

export class UserController {
  constructor(private userRepo: UserRepo = new UserRepo()) {}
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = (req.user as JwtUserPayload).id;
      const userProfile = await this.userRepo.getById(userId);
      const validatedData = user_profileToDTO.parse(userProfile);
      res.status(HttpStatus.OK).json(successResponse(validatedData, '獲取個人資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = (req.user as JwtUserPayload).id;
      const validatedData = user_profileUpdateSchema.parse(req.body);
      const updatedUserProfile = await this.userRepo.update(userId, validatedData);
      const dtoData = user_profileUpdateToDTO.parse(updatedUserProfile);

      res.status(HttpStatus.OK).json(successResponse(dtoData, '更新個人資料成功'));
    } catch (error) {
      console.error('更新用戶資料失敗:', error);
      next(error);
    }
  }
}

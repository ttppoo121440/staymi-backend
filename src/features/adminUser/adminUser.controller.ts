import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { roleEnumList } from '../auth/auth.schema';

import { AdminUserRepo } from './adminUser.repo';
import { adminUserQuerySchema } from './adminUser.schema';

export class AdminUserController {
  private adminUserRepo = new AdminUserRepo();
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = adminUserQuerySchema.parse(req.query);
      const { email = '', is_blacklisted, currentPage, perPage } = parsedQuery;

      const users = await this.adminUserRepo.getAll(email, is_blacklisted, currentPage, perPage);
      console.log(users);
      res.status(HttpStatus.OK).json(successResponse(users, '獲取所有會員資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.adminUserRepo.getById(id);
      res.status(HttpStatus.OK).json(successResponse(user, '獲取用戶資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      next(error);
    }
  }
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return appError('請提供角色', next, HttpStatus.BAD_REQUEST);
      }

      // 驗證角色是否有效
      if (!roleEnumList.includes(role)) {
        return appError('無效的角色值', next, HttpStatus.BAD_REQUEST);
      }

      const updatedUser = await this.adminUserRepo.updateRole(id, role);
      res.status(HttpStatus.OK).json(successResponse(updatedUser, '更新用戶角色成功'));
    } catch (error) {
      console.error('更新用戶角色失敗:', error);
      next(error);
    }
  }
}

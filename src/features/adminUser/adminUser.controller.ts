import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { AdminUserRepo } from './adminUser.repo';
import {
  adminUserToDTO,
  adminUserQuerySchema,
  adminUserArrayToDTO,
  adminUserUpdateRoleSchema,
} from './adminUser.schema';

export class AdminUserController {
  constructor(private adminUserRepo = new AdminUserRepo()) {}
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = adminUserQuerySchema.parse(req.query);
      const { email = '', is_blacklisted, currentPage, perPage } = parsedQuery;

      const users = await this.adminUserRepo.getAll(email, is_blacklisted, currentPage, perPage);
      const usersToDTO = adminUserArrayToDTO.parse(users);
      res.status(HttpStatus.OK).json(successResponse(usersToDTO, '獲取所有會員資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.adminUserRepo.getById(id);
      const dtoData = adminUserToDTO.parse(user);

      res.status(HttpStatus.OK).json(successResponse(dtoData, '獲取用戶資料成功'));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      next(error);
    }
  }
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = adminUserUpdateRoleSchema.parse(req.body);

      const updatedUser = await this.adminUserRepo.updateRole(id, validatedData);
      res.status(HttpStatus.OK).json(successResponse(updatedUser, '更新用戶角色成功'));
    } catch (error) {
      console.error('更新用戶角色失敗:', error);
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { AdminUserRepo } from './adminUser.repo';
import {
  adminUserToDTO,
  adminUserQuerySchema,
  adminUserListToDto,
  adminUserUpdateRoleToDto,
  adminUserUpdateRoleType,
} from './adminUser.schema';

export class AdminUserController {
  constructor(private adminUserRepo = new AdminUserRepo()) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = adminUserQuerySchema.parse(req.query);
    const { email = '', is_blacklisted, currentPage, perPage } = parsedQuery;

    const result = await this.adminUserRepo.getAll(email, is_blacklisted, currentPage, perPage);
    const usersToDTO = adminUserListToDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(usersToDTO, '獲取所有會員資料成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.adminUserRepo.getById(id);
    const dtoData = adminUserToDTO.parse(user);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '獲取用戶資料成功'));
  });
  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const data = { id, role } as adminUserUpdateRoleType;

    const result = await this.adminUserRepo.updateRole(data);
    const dtoData = adminUserUpdateRoleToDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新用戶角色成功'));
  });
  toggleUserBlacklist = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const toggle = await this.adminUserRepo.getUserBlacklistStatus(id);
    if (toggle === null) {
      return next(appError('用戶不存在', HttpStatus.NOT_FOUND));
    }
    const result = await this.adminUserRepo.toggleUserBlacklist(id, !toggle);
    res.status(HttpStatus.OK).json(successResponse(result, '更新用戶黑白名單狀態成功'));
  });
  getUserCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await this.adminUserRepo.getUserCount();
    res.status(HttpStatus.OK).json(successResponse({ count }, '獲取用戶數量成功'));
  });
}

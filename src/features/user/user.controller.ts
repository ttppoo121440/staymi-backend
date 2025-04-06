import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { errorResponse, successResponse } from '@/utils/appResponse';

import { userRepo } from './user.repo';

export class UserController {
  private userRepo = new userRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepo.getAll();
      res.status(200).json(successResponse(users, '成功取得用戶列表'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userRepo.create(req.body);
      res.status(201).json(successResponse(user, '成功新增用戶'));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(errorResponse(error.errors[0]?.message));
      } else if (error instanceof Error && error.message.includes('duplicate key value')) {
        res.status(400).json(errorResponse('名稱已存在，請使用其他名稱'));
      } else {
        console.error(error);
        res.status(500).json(errorResponse('內部伺服器錯誤'));
      }
    }
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await this.userRepo.login(email, password);
      res.status(200).json(successResponse({ token }, '登入成功'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('內部伺服器錯誤'));
      }
    }
  }
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtUserPayload).id;
      if (!userId) {
        throw new Error('無法獲取用戶ID');
      }
      const profile = await this.userRepo.getById(userId);
      res.status(200).json(successResponse(profile, '成功取得用戶資料'));
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);

        res.status(400).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('內部伺服器錯誤'));
      }
    }
  }
}

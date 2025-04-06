import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorResponse, successResponse } from '@/utils/appResponse';

import { Credit_packageRepo } from './credit_package.repo';
import { CreditPackageCreate, CreditPackageArrayResponseSchema } from './credit_package.schema';

export class Credit_packageController {
  private creditPackageRepo = new Credit_packageRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const creditPackages = await this.creditPackageRepo.getAll();
      const validatedData = CreditPackageArrayResponseSchema.parse(creditPackages);
      res.status(200).json(successResponse(validatedData, '成功取得信用套餐'));
    } catch (error) {
      console.log('取得信用套餐時發生錯誤:', error);

      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreditPackageCreate.parse(req.body);
      const newPackage = await this.creditPackageRepo.create(validatedData);
      res.status(201).json(successResponse(newPackage, '成功新增信用套餐'));
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsedId = Number(id);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        res.status(400).json(errorResponse('無效的 ID 格式'));
        return;
      }

      const isDeleted = await this.creditPackageRepo.delete(parsedId);

      if (!isDeleted) {
        res.status(404).json(errorResponse('找不到該信用套餐'));
        return;
      }

      res.status(200).json(successResponse(null, '成功刪除信用套餐'));
    } catch (error) {
      console.error('刪除信用套餐時發生錯誤:', error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
}

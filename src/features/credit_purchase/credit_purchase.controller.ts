import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { errorResponse, successResponse } from '@/utils/appResponse';

import { Credit_purchaseRepo } from './credit_purchase.repo';

export class Credit_purchaseController {
  private Credit_purchaseRepo = new Credit_purchaseRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const credit_purchase = await this.Credit_purchaseRepo.getAll();
      res.status(200).json(successResponse(credit_purchase, '成功取得訂單列表'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtUserPayload).id;
      const creditPackageId = Number(req.params.creditPackageId);

      if (!userId) {
        res.status(400).json(errorResponse('使用者ID不存在'));
        return;
      }
      if (isNaN(creditPackageId)) {
        res.status(400).json({ message: '無效的方案 ID' });
        return;
      }

      const credit_purchase = await this.Credit_purchaseRepo.create(req.body);
      res.status(201).json(successResponse(credit_purchase, '成功新增訂單'));
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
}

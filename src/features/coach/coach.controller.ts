import type { Request, Response } from 'express';

import { errorResponse, successResponse } from '../../utils/appResponse';

import { CoachRepo } from './coach.repo';
import { CoachArrayResponseSchema, CoachCreate, CoachResponseSchema } from './coach.schema';

export class CoachController {
  private CoachRepo = new CoachRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const per = Number(req.query.per) || 10;
      const page = Number(req.query.page) || 1;

      if (isNaN(per) || isNaN(page) || per <= 0 || page <= 0) {
        res.status(400).json(errorResponse('per 和 page 需為正數'));
      }
      const creditPackages = await this.CoachRepo.getAll(per, page);
      const validatedData = CoachArrayResponseSchema.parse(creditPackages);
      res.status(200).json(successResponse(validatedData, '成功取得教練'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creditPackages = await this.CoachRepo.getById(Number(id));
      const validatedData = CoachResponseSchema.parse(creditPackages);
      res.status(200).json(successResponse(validatedData, '成功取得教練'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CoachCreate.parse(req.body);
      const newPackage = await this.CoachRepo.create(validatedData);
      res.status(201).json(successResponse(newPackage, '成功新增教練'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
}

import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorResponse, successResponse } from '../../utils/appResponse';

import { CourseRepo } from './course.repo';
import { CourseArrayResponseSchema, CourseCreate } from './course.schema';

export class CourseController {
  private CourseRepo = new CourseRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const creditPackages = await this.CourseRepo.getAll();
      const validatedData = CourseArrayResponseSchema.parse(creditPackages);
      res.status(200).json(successResponse(validatedData, '成功取得課程'));
    } catch (error) {
      console.log('取得課程時發生錯誤:', error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async adminGetAll(req: Request, res: Response): Promise<void> {
    try {
      const creditPackages = await this.CourseRepo.adminGetAll();
      const validatedData = CourseArrayResponseSchema.parse(creditPackages);
      res.status(200).json(successResponse(validatedData, '成功取得課程'));
    } catch (error) {
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async adminCreate(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CourseCreate.parse(req.body);
      const newPackage = await this.CourseRepo.adminCreate(validatedData);
      res.status(201).json(successResponse(newPackage, '成功新增課程'));
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        res.status(400).json(errorResponse('資料格式錯誤', error.errors));
      }
    }
  }
  async adminUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id);

      const validatedData = CourseCreate.parse(req.body);
      const newPackage = await this.CourseRepo.adminUpdate(Number(id), validatedData);
      res.status(200).json(successResponse(newPackage, '成功更新課程'));
    } catch (error) {
      console.log(error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
}

import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorResponse, successResponse } from '../../utils/appResponse';

import { Course_bookingRepo } from './course_booking.repo';
import { Course_bookingArrayResponseSchema, Course_bookingCreate } from './course_booking.schema';

export class Course_bookingController {
  private Course_bookingRepo = new Course_bookingRepo();
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const course_booking = await this.Course_bookingRepo.getAll();
      const validatedData = Course_bookingArrayResponseSchema.parse(course_booking);
      res.status(200).json(successResponse(validatedData, '成功取得課程預約'));
    } catch (error) {
      console.log('取得課程時發生錯誤:', error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = Course_bookingCreate.parse(req.body);
      const newPackage = await this.Course_bookingRepo.create(validatedData);
      res.status(201).json(successResponse(newPackage, '成功新增課程預約'));
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        res.status(400).json(errorResponse('資料格式錯誤', error.errors));
      }
    }
  }
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id);

      const validatedData = Course_bookingCreate.parse(req.body);
      const newPackage = await this.Course_bookingRepo.update(Number(id), validatedData);
      res.status(200).json(successResponse(newPackage, '成功更新課程預約'));
    } catch (error) {
      console.log(error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.Course_bookingRepo.delete(Number(id));
      if (result) {
        res.status(200).json(successResponse({}, '成功刪除課程預約'));
      } else {
        res.status(404).json(errorResponse('找不到該課程預約'));
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(errorResponse('內部伺服器錯誤'));
    }
  }
}

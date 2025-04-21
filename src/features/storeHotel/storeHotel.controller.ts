import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';
import logger from '@/utils/logger';

import { StoreHotelRepo } from './storeHotel.repo';
import { hotelCreateSchema } from './storeHotel.schema';

export class StoreHotelController {
  constructor(private storeHotelRepo: StoreHotelRepo = new StoreHotelRepo()) {}

  async createHotel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = hotelCreateSchema.parse(req.body);
      const newHotel = await this.storeHotelRepo.create(validatedData);
      res.status(HttpStatus.CREATED).json(successResponse(newHotel, '酒店創建成功'));
    } catch (error) {
      logger.error('酒店創建失敗:', error);
      next(error);
    }
  }
}

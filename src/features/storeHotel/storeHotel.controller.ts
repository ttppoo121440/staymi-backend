import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from './storeHotel.repo';
import { hotelCreateSchema } from './storeHotel.schema';

export class StoreHotelController {
  constructor(private storeHotelRepo: StoreHotelRepo = new StoreHotelRepo()) {}

  createHotel = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = hotelCreateSchema.parse(req.body);
    const newHotel = await this.storeHotelRepo.create(validatedData);
    res.status(HttpStatus.CREATED).json(successResponse(newHotel, '酒店創建成功'));
  });
}

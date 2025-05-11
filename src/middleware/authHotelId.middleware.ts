import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { StoreHotelRepo } from '@/features/storeHotel/storeHotel.repo';
import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';

export const authHotelId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const brand_id = res.locals.brand_id;

  const storeHotelRepo = new StoreHotelRepo();
  const hotels = await storeHotelRepo.getAll(brand_id);
  const hotelId = hotels.hotels[0].id;
  if (!hotelId) {
    return next(appError('目前尚未建立飯店', HttpStatus.NOT_FOUND));
  }
  res.locals.hotel_id = hotelId;

  next();
});

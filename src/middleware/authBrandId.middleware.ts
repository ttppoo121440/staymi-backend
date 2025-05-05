import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { verifyBrandOwner } from '@/features/brand/brand.repo';
import { StoreHotelRepo } from '@/features/storeHotel/storeHotel.repo';
import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
export const authBrandId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtUserPayload;

  if (user.role !== 'store' || !('brand_id' in user)) {
    throw appError('需要商家身分', HttpStatus.UNAUTHORIZED);
  }

  res.locals.brand_id = user.brand_id;

  const isOwner = await verifyBrandOwner(user.brand_id, user.id);
  if (!isOwner) {
    throw appError('無權限操作此資料', HttpStatus.FORBIDDEN);
  }

  //取得 hotel_id 的 workaround，登入時直接撈取第一筆 hotel 的 id 存到 locals
  const storeHotelRepo = new StoreHotelRepo();
  const hotels = await storeHotelRepo.getAll(user.brand_id);
  const hotelId = hotels.hotels[0].id;
  if (!hotelId) {
    return next(appError('目前尚未建立飯店', HttpStatus.NOT_FOUND));
  }
  res.locals.hotel_id = hotelId;

  next();
});

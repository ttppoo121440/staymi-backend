import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { verifyBrandOwner } from '@/features/brand/brand.repo';
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

  next();
});

import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { verifyBrandOwner } from '@/features/brand/brand.repo';
import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
export const authBrandId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtUserPayload;
  // 類型守衛：檢查是不是 store user
  if (user.role !== 'store' || !('brand_id' in user)) {
    throw appError('需要商家身分', HttpStatus.UNAUTHORIZED);
  }
  // 現在 TypeScript 確定 user 是 JwtStorePayload
  req.brand_id = user.brand_id;

  const isOwner = await verifyBrandOwner(user.brand_id, user.id);
  if (!isOwner) {
    throw appError('無權限操作此資料', HttpStatus.FORBIDDEN);
  }

  next();
});

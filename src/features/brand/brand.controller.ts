import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { NextFunction } from 'express-serve-static-core';

import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { BrandRepo } from './brand.repo';
export class BrandController {
  constructor(private brandRepo = new BrandRepo()) {}
  getBrandCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const count = await this.brandRepo.getBrandCount();
    if (!count) {
      return next(appError('沒有品牌資料', HttpStatus.NOT_FOUND));
    }
    res.status(HttpStatus.OK).json(successResponse({ count }, '取得商家數量成功'));
  });
}

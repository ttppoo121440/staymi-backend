import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { SubscriptionRepo } from './subscription.repo';
import { subscriptionToDTO } from './subscription.schema';

export class SubscriptionController {
  constructor(private subscriptionRepo: SubscriptionRepo = new SubscriptionRepo()) {}

  getByUserId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // middleware JWT解碼 取得使用者資訊
    const id: string = (req.user as JwtUserPayload).id;
    const result = await this.subscriptionRepo.getByUserId(id);
    if (!result) {
      return next(appError('查無訂閱資料', HttpStatus.NOT_FOUND));
    }
    // 轉換資料格式
    const dtoData = subscriptionToDTO.parse({ subscriptions: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '查詢成功'));
  });
}

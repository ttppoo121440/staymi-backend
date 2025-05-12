import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { SubscriptionRepo } from './subscription.repo';
import { subscriptionToDTO, subscriptionIsRecurringToDTO } from './subscription.schema';

export class SubscriptionController {
  constructor(private subscriptionRepo: SubscriptionRepo = new SubscriptionRepo()) {}

  getPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // middleware JWT解碼 取得使用者資訊
    const id: string = (req.user as JwtUserPayload).id;
    const result = await this.subscriptionRepo.getPlanByUserId(id);
    if (!result) {
      return next(appError('查無訂閱資料', HttpStatus.NOT_FOUND));
    }
    // 轉換資料格式
    const dtoData = subscriptionToDTO.parse({ subscriptions: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '查詢成功'));
  });

  updateIsRecurring = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id: string = (req.user as JwtUserPayload).id;
    const { is_recurring } = req.body as { is_recurring: boolean };

    // 取得最新一筆訂閱資料
    const latestIsRecurring = await this.subscriptionRepo.getLatestIsRecurringByUserId(id);
    if (!latestIsRecurring) {
      return next(appError('找不到訂閱資訊，請先訂閱', HttpStatus.NOT_FOUND));
    }
    if (latestIsRecurring.is_recurring === is_recurring) {
      const msg = latestIsRecurring.is_recurring ? '已經是自動訂閱狀態' : '已經是取消自動訂閱狀態';
      res.status(HttpStatus.OK).json(successResponse(undefined, msg));
      return;
    }

    const result = await this.subscriptionRepo.updateIsRecurringByUserIdAndIsRecurring(id, is_recurring);
    const dtoData = subscriptionIsRecurringToDTO.parse(result);
    const msg = dtoData.is_recurring ? '設定自動訂閱成功' : '取消訂閱成功';
    res.status(HttpStatus.OK).json(successResponse(undefined, msg));
  });
}

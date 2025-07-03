import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { SubscriptionRepo } from './subscription.repo';
import {
  subscriptionToDTO,
  subscriptionIsRecurringToDTO,
  subscriptionHistoryToDTO,
  subscriptionCreateType,
} from './subscription.schema';

export class SubscriptionController {
  constructor(private subscriptionRepo: SubscriptionRepo = new SubscriptionRepo()) {}

  getPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // middleware JWT解碼 取得使用者資訊
    const id: string = (req.user as JwtUserPayload).id;
    let result = await this.subscriptionRepo.getPlanByUserId(id);
    if (!result) {
      // 如果沒有訂閱資料，則建立預設的免費訂閱
      result = await this.subscriptionRepo.createDefaultSubscription(id, { plan: 'free' } as subscriptionCreateType);
      if (!result) {
        return next(appError('建立預設訂閱失敗', HttpStatus.INTERNAL_SERVER_ERROR));
      }
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

  getPlanHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id: string = (req.user as JwtUserPayload).id;
    const { currentPage, perPage } = QuerySchema.parse(req.query);
    const result = await this.subscriptionRepo.getPlanHistoryByUserId(id, currentPage, perPage);
    if (result.history.length == 0) {
      return next(appError('查無訂閱紀錄', HttpStatus.NOT_FOUND));
    }
    const dtoData = subscriptionHistoryToDTO.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '訂閱紀錄取得成功'));
  });

  /**
   * 變更訂閱方案
   */
  updatePlan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id: string = (req.user as JwtUserPayload).id;
    const { plan } = req.body as { plan: 'free' | 'plus' | 'pro' };
    const { cycle } = req.body as { cycle: 'monthly' | 'quarterly' | 'yearly' };
    const getPlanResult = await this.subscriptionRepo.getPlanByUserId(id);

    // 如果沒訂閱資訊，則建立新的訂閱
    if (!getPlanResult) {
      // 如果 free 方案直接建立
      if (plan === 'free') {
        // 直接建立免費訂閱
        try {
          await this.subscriptionRepo.createDefaultSubscription(id, req.body);
          res.status(HttpStatus.OK).json(successResponse(undefined, `訂閱 ${plan} 方案成功`));
          return;
        } catch (error) {
          return next(appError(`訂閱 ${plan} 方案失敗`, HttpStatus.INTERNAL_SERVER_ERROR));
        }
      } else {
        // 付費方案需要建立並付款
        const subscriptionData = {
          subscriptionInfo: {
            plan,
            cycle: cycle,
            user_id: id,
            started_at: new Date().toISOString(),
          },
          paymentApiUrl: '/paypal/create-subscription',
        };

        res.status(HttpStatus.OK).json(successResponse(subscriptionData, `訂閱 ${plan} 方案，即將跳轉付款`));
        return;
      }
    } else {
      // 定義方案等級
      const planLevels = { free: 1, plus: 2, pro: 3 };
      const currentLevel = planLevels[getPlanResult.plan];
      const targetLevel = planLevels[plan];

      // 檢查是否為降級操作
      if (targetLevel < currentLevel) {
        return next(appError('暫不支援降級方案', HttpStatus.BAD_REQUEST));
      }
      const result = await this.subscriptionRepo.updatePlanByUserIdAndPlan(id, plan);
      if (!result) {
        return next(appError('變更訂閱失敗', HttpStatus.INTERNAL_SERVER_ERROR));
      }

      // 未變更方案
      if (!result.isUpdate) {
        res.status(HttpStatus.OK).json(successResponse(undefined, `已是此訂閱方案${plan}`));
        return;
      }

      // 如果是需要付費的方案升級 (free -> plus/pro 或 plus -> pro)
      if (plan !== 'free' && targetLevel > currentLevel) {
        // 回傳訂閱資料
        const subscriptionData = {
          canUpgrade: result.isUpdate,
          subscriptionInfo: {
            plan,
            cycle: cycle,
            user_id: id,
            started_at: new Date().toISOString(),
          },
          paymentApiUrl: '/paypal/create-subscription',
        };

        res.status(HttpStatus.OK).json(successResponse(subscriptionData, `準備升級到 ${plan} 方案，請完成付款流程`));
        return;
      }

      res.status(HttpStatus.OK).json(successResponse(undefined, '訂閱方案變更成功'));
    }
  });
}

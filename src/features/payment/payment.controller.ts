import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { PaymentRepo } from './payment.repo';
export class PaymentController {
  constructor(private paymentRepo = new PaymentRepo()) {}
  getTotalConfirmedRevenue = asyncHandler(async (req: Request, res: Response) => {
    const totalRevenue = await this.paymentRepo.getTotalConfirmedRevenue();
    res.status(HttpStatus.OK).json(successResponse({ total: totalRevenue }, '取得總收入成功'));
  });
  getRecentPayment = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 5;
    const recentPayments = await this.paymentRepo.getRecentPayment(limit);
    res.status(HttpStatus.OK).json(successResponse({ recent: recentPayments }, '取得最近付款成功'));
  });
}

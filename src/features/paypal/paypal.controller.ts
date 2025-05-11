import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';
import { PayPalService } from '@/utils/services/paypal.service';
export class PayPalController {
  constructor(private paypalService = new PayPalService()) {}
  createPayPalOrder = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.paypalService.createOrder();
    res.status(HttpStatus.OK).json(successResponse(result, '建立訂單成功'));
  });
  capturePayPalOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const result = await this.paypalService.captureOrder(orderId);
    res.status(HttpStatus.OK).json(successResponse(result, '捕獲訂單成功'));
  });
}

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';
import { SubscriptionService } from '@/utils/services/subscription.service';

import { OrderRoomProductRepo } from '../orderRoomProduct/orderRoomProduct.repo';
import { OrderRoomProductService } from '../orderRoomProduct/orderRoomProductService';
import { OrderRoomProductItemRepo } from '../orderRoomProductItem/orderRoomProductItem.repo';
import { ProductPlanRepo } from '../productPlan/productPlan.repo';
import { RoomPlanRepo } from '../roomPlan/roomPlan.repo';
import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { paypalDto } from './paypal.schema';
import { PayPalService } from './paypal.service';

export class PayPalController {
  constructor(
    private paypalService = new PayPalService(),
    private orderRoomProductRepo = new OrderRoomProductRepo(),
    private roomPlanRepo = new RoomPlanRepo(),
    private subscriptionService = new SubscriptionService(),
    private storeHotelRepo = new StoreHotelRepo(),
    private productPlanRepo = new ProductPlanRepo(),
    private orderRoomProductItemRepo = new OrderRoomProductItemRepo(),
    private orderRoomProductService = new OrderRoomProductService(
      orderRoomProductRepo,
      roomPlanRepo,
      productPlanRepo,
      orderRoomProductItemRepo,
      storeHotelRepo,
      subscriptionService,
    ),
  ) {}
  createPayPalOrder = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = res.locals;
    const data = { ...req.body, user_id };
    // 1. 建立本地訂單
    const orderResult = await this.orderRoomProductService.createOrder(data);
    // 2. 建立 PayPal 訂單，傳入我們本地的訂單 ID
    const paypalOrder = await this.paypalService.createOrder(orderResult.order.id, user_id);

    res.status(HttpStatus.OK).json(successResponse({ ...paypalOrder, id: orderResult.order.id }, '建立訂單成功'));
  });
  capturePayPalOrder = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = res.locals;
    const { order_type, method } = req.body;
    const orderId = req.params.id;
    const result = await this.paypalService.captureAndMarkOrderAsPaid(user_id, orderId, { order_type, method });
    const dtoData = paypalDto.parse({ payment: result });

    res.status(HttpStatus.OK).json(successResponse(dtoData, '付款成功'));
  });
}

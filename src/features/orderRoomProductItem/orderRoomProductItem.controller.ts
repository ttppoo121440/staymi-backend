import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { OrderRoomProductItemRepo } from '../orderRoomProductItem/orderRoomProductItem.repo';

import { productPlansSchema } from './orderRoomProductItem.schema';

export class OrderRoomProductItemController {
  constructor(private orderRoomProductItemRepo = new OrderRoomProductItemRepo()) {}
  getByHotelProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id;
    if (!hotelId) {
      return next(appError('缺少必要的參數: id', HttpStatus.BAD_REQUEST));
    }
    const result = await this.orderRoomProductItemRepo.getByHotelProduct(hotelId);
    if (result.length === 0) {
      return next(appError('沒有找到相關的計畫伴手禮', HttpStatus.NOT_FOUND));
    }
    const productPlansFilter = result
      .filter((item) => item.id && item.product_id)
      .map((item) => productPlansSchema.parse(item));
    res.status(HttpStatus.OK).json(successResponse({ productPlans: productPlansFilter }, '取得計畫伴手禮清單成功'));
  });
  getByHotelProductItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id;
    const productId = req.params.productId;

    if (!hotelId || !productId) {
      return next(appError('缺少必要的參數: hotelId 或 productId', HttpStatus.BAD_REQUEST));
    }
    const result = await this.orderRoomProductItemRepo.getByHotelProductItem(hotelId, productId);
    if (!result) {
      return next(appError('沒有找到相關的計畫伴手禮', HttpStatus.NOT_FOUND));
    }
    const productPlansFilter = productPlansSchema.parse(result);
    res.status(HttpStatus.OK).json(successResponse({ productPlans: productPlansFilter }, '取得計畫伴手禮成功'));
  });
  getSouvenirSalesDashboard = asyncHandler(async (req: Request, res: Response) => {
    const [total, top5] = await Promise.all([
      this.orderRoomProductItemRepo.countTotalConfirmedSouvenirSales(),
      this.orderRoomProductItemRepo.getTopSellingSouvenirProducts(),
    ]);
    res.status(HttpStatus.OK).json(successResponse({ total, top5 }, '取得計畫伴手禮銷售資料成功'));
  });
}

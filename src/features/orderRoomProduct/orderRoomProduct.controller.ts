import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import { SubscriptionService } from '@/utils/services/subscription.service';

import { RoomPlanRepo } from '../roomPlan/roomPlan.repo';
import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { OrderRoomProductRepo } from './orderRoomProduct.repo';
import { orderRoomProductDto, orderRoomProductListDto, StatusType } from './orderRoomProduct.schema';

export class OrderRoomProductController {
  constructor(
    private orderRoomProductRepo = new OrderRoomProductRepo(),
    private roomPlanRepo = new RoomPlanRepo(),
    private subscriptionService = new SubscriptionService(),
    private storeHotelRepo = new StoreHotelRepo(),
  ) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const status = req.query.status as StatusType;
    const { currentPage, perPage } = QuerySchema.parse(req.query);
    const result = await this.orderRoomProductRepo.getAll(userId, status, currentPage, perPage);
    const dtoData = orderRoomProductListDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id: string = (req.user as JwtUserPayload).id;
    const id = req.params.id;
    const data = { ...req.body, user_id };
    await this.storeHotelRepo.getById({ hotelId: data.hotel_id });
    const result = await this.orderRoomProductRepo.getById(id, data.user_id);
    if (!result?.order) {
      return next(appError('找不到對應的訂房訂單', HttpStatus.NOT_FOUND));
    }
    const roomPlanResult = await this.roomPlanRepo.getPriceById(data.room_plans_id);
    if (roomPlanResult.length === 0) {
      return next(appError('找不到對應的住宿計畫', HttpStatus.NOT_FOUND));
    }
    const dtoData = orderRoomProductDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單成功'));
  });
  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id: string = (req.user as JwtUserPayload).id;
    const data = { ...req.body, user_id: user_id };
    await this.storeHotelRepo.getById({ hotelId: data.hotel_id });
    // 時間驗證
    const checkInDate = new Date(data.check_in_date);
    const checkOutDate = new Date(data.check_out_date);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return next(appError('退房日期必須晚於入住日期', HttpStatus.BAD_REQUEST));
    }

    const roomPlanResult = await this.roomPlanRepo.getPriceById(data.room_plans_id);
    if (roomPlanResult.length === 0) {
      return next(appError('找不到對應的住宿計畫', HttpStatus.NOT_FOUND));
    }

    const roomPlan = roomPlanResult[0];
    const isSubscribed = await this.subscriptionService.isActiveSubscription(user_id);

    const total_price = this.subscriptionService.calculateRoomPlanPrice({
      isSubscribed,
      roomPlan,
      days,
    });

    const result = await this.orderRoomProductRepo.create(total_price, data);
    const dtoData = orderRoomProductDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '訂房訂單建立成功'));
  });
  updateStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id: string = (req.user as JwtUserPayload).id;
    const id = req.params.id;
    const data = { ...req.body, user_id, id };
    await this.storeHotelRepo.getById({ hotelId: data.hotel_id });
    const result = await this.orderRoomProductRepo.updateStatus(id, user_id, data);
    if (!result.order) {
      return next(appError('找不到對應的訂房訂單', HttpStatus.NOT_FOUND));
    }
    const dtoData = orderRoomProductDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '訂房訂單狀態更新成功'));
  });
}

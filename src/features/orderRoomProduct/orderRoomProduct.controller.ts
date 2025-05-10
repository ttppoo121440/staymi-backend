import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { RoomPlanRepo } from '../roomPlan/roomPlan.repo';

import { OrderRoomProductRepo } from './orderRoomProduct.repo';
import {
  orderRoomProductCreateSchema,
  orderRoomProductDto,
  orderRoomProductListDto,
  StatusType,
} from './orderRoomProduct.schema';

export class OrderRoomProductController {
  constructor(private orderRoomProductRepo = new OrderRoomProductRepo(), private roomPlanRepo = new RoomPlanRepo()) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const status = req.query.status as StatusType;
    const { currentPage, perPage } = QuerySchema.parse(req.query);
    const result = await this.orderRoomProductRepo.getAll(userId, status, currentPage, perPage);
    const dtoData = orderRoomProductListDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單列表成功'));
  });
  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const data = { ...req.body, user_id: userId };

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
    const validatedData = orderRoomProductCreateSchema.parse(data);

    const roomPlanPrice = roomPlanResult[0].price;
    const total_price = roomPlanPrice * days;
    const result = await this.orderRoomProductRepo.create(total_price, validatedData);
    const dtoData = orderRoomProductDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '訂房訂單建立成功'));
  });
}

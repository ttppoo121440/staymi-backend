import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { RoomPlanRepo } from './roomPlan.repo';
import { roomPlanDto, roomPlanListDto } from './roomPlan.schema';

export class RoomPlanController {
  constructor(private roomPlanRepo = new RoomPlanRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    const parsedQuery = QuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const result = await this.roomPlanRepo.getAll(hotelId, currentPage, perPage);
    const dtoData = roomPlanListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得計畫列表成功'));
  });

  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: roomPlanId } = req.params;

    const result = await this.roomPlanRepo.getById({ id: roomPlanId, hotelId: hotelId });
    if (!result) {
      return next(appError('計畫不存在', HttpStatus.NOT_FOUND));
    }
    const dtoData = roomPlanDto.parse({ roomPlan: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得計畫資料成功'));
  });

  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;

    const result = await this.roomPlanRepo.create({ ...req.body, hotel_id: hotelId });
    if (!result) {
      return next(appError('創建計畫失敗', HttpStatus.INTERNAL_SERVER_ERROR));
    }
    const dtoData = roomPlanDto.parse({ roomPlan: result });
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '創建計畫成功'));
  });

  update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: roomPlanId } = req.params;

    const result = await this.roomPlanRepo.update({ ...req.body, id: roomPlanId, hotel_id: hotelId });
    if (!result) {
      return next(appError('計畫不存在', HttpStatus.NOT_FOUND));
    }
    const dtoData = roomPlanDto.parse({ roomPlan: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新計畫成功'));
  });

  toggleActive = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: roomPlanId } = req.params;

    const roomPlan = await this.roomPlanRepo.getById({ id: roomPlanId, hotelId: hotelId });
    if (!roomPlan) {
      return next(appError('計畫不存在', HttpStatus.NOT_FOUND));
    }

    const result = await this.roomPlanRepo.update({
      is_active: !roomPlan.is_active,
      id: roomPlanId,
      hotel_id: hotelId,
    });
    const dtoData = roomPlanDto.parse({ roomPlan: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '計畫狀態切換成功'));
  });

  delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: roomPlanId } = req.params;

    const result = await this.roomPlanRepo.delete({ id: roomPlanId, hotel_id: hotelId });
    if (!result) {
      return next(appError('查無此資料，刪除失敗', HttpStatus.NOT_FOUND));
    }
    res.status(HttpStatus.OK).json(successResponse(null, '計畫刪除成功'));
  });
}

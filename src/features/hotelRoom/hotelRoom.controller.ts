import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { HotelRoomRepo } from './hotelRoom.repo';
import {
  hotelRoomCreateSchema,
  hotelRoomDeleteSchema,
  hotelRoomDto,
  hotelRoomListDto,
  hotelRoomToggleActiveSchema,
  hotelRoomUpdateSchema,
} from './hotelRoom.schema';

export class HotelRoomController {
  constructor(private hotelRoomRepo = new HotelRoomRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    const parsedQuery = QuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const result = await this.hotelRoomRepo.getAll(hotelId, currentPage, perPage);
    const dtoData = hotelRoomListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房間列表成功'));
  });

  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: hotelRoomId } = req.params;

    const result = await this.hotelRoomRepo.getById({ id: hotelRoomId, hotelId: hotelId });
    if (!result) {
      return next(appError('飯店房間不存在', HttpStatus.NOT_FOUND));
    }
    const dtoData = hotelRoomDto.parse({ hotelRoom: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房間資料成功'));
  });

  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;

    const validatedData = hotelRoomCreateSchema.parse({ ...req.body, hotel_id: hotelId });
    const result = await this.hotelRoomRepo.create(validatedData);
    if (!result) {
      return next(appError('創建飯店房間失敗', HttpStatus.INTERNAL_SERVER_ERROR));
    }
    const dtoData = hotelRoomDto.parse({ hotelRoom: result });
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '創建飯店房間成功'));
  });

  update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: hotelRoomId } = req.params;

    const validatedData = hotelRoomUpdateSchema.parse({ ...req.body, id: hotelRoomId, hotel_id: hotelId });
    const result = await this.hotelRoomRepo.update(validatedData);
    if (!result) {
      return next(appError('飯店房間不存在', HttpStatus.NOT_FOUND));
    }
    const dtoData = hotelRoomDto.parse({ hotelRoom: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新飯店房間成功'));
  });

  toggleActive = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: hotelRoomId } = req.params;

    const hotelRoom = await this.hotelRoomRepo.getById({ id: hotelRoomId, hotelId: hotelId });
    if (!hotelRoom) {
      return next(appError('飯店房間不存在', HttpStatus.NOT_FOUND));
    }
    const validatedData = hotelRoomToggleActiveSchema.parse({
      is_active: !hotelRoom.is_active,
      id: hotelRoomId,
      hotel_id: hotelId,
    });
    const result = await this.hotelRoomRepo.update(validatedData);
    const dtoData = hotelRoomDto.parse({ hotelRoom: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '飯店房間狀態切換成功'));
  });

  delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { hotel_id: hotelId } = res.locals;
    const { id: hotelRoomId } = req.params;
    const validatedData = hotelRoomDeleteSchema.parse({ id: hotelRoomId, hotel_id: hotelId });
    const result = await this.hotelRoomRepo.delete(validatedData);
    if (!result) {
      return next(appError('查無此資料，刪除失敗', HttpStatus.NOT_FOUND));
    }
    res.status(HttpStatus.OK).json(successResponse(null, '飯店房間刪除成功'));
  });
}

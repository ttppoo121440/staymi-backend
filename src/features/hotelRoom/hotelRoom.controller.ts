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
  hotelRoomUpdateIsActiveSchema,
  hotelRoomUpdateSchema,
} from './hotelRoom.schema';

export class HotelRoomController {
  constructor(private hotelRoomRepo = new HotelRoomRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = res.locals.hotel_id;

    const parsedQuery = QuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const result = await this.hotelRoomRepo.getAll(hotelId, currentPage, perPage);
    const dtoData = hotelRoomListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房間列表成功'));
  });

  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = res.locals.hotel_id;
    const hotelRoomId = req.params.id;

    const result = await this.hotelRoomRepo.getById({ hotelRoomId, hotelId: hotelId });
    if (!result?.hotelRoom) {
      return next(appError('飯店房間不存在', HttpStatus.NOT_FOUND));
    }
    const dtoData = hotelRoomDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房間資料成功'));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = hotelRoomCreateSchema.parse({ ...req.body });
    const result = await this.hotelRoomRepo.create(validatedData);
    const dtoData = hotelRoomDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '創建飯店房間成功'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = res.locals.hotel_id;
    const hotelRoomId = req.params.id;

    const validatedData = hotelRoomUpdateSchema.parse({ ...req.body, id: hotelRoomId, hotel_id: hotelId });
    await this.hotelRoomRepo.getById({ hotelRoomId });
    const result = await this.hotelRoomRepo.update(validatedData);
    const dtoData = hotelRoomDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新飯店房間成功'));
  });
  updateIsActive = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = res.locals.hotel_id;
    const hotelRoomId = req.params.id;
    const { is_active } = req.body;

    const existed = await this.hotelRoomRepo.getById({ hotelRoomId });
    if (!existed?.hotelRoom) {
      return next(appError('飯店房間不存在', HttpStatus.NOT_FOUND));
    }

    const validatedData = hotelRoomUpdateIsActiveSchema.parse({
      is_active: is_active,
      id: hotelRoomId,
      hotel_id: hotelId,
    });
    const result = await this.hotelRoomRepo.update(validatedData);
    const dtoData = hotelRoomDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '飯店房間狀態切換成功'));
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = res.locals.hotel_id;
    const hotelRoomId = req.params.id;
    const validatedData = hotelRoomDeleteSchema.parse({ id: hotelRoomId, hotel_id: hotelId });
    await this.hotelRoomRepo.delete(validatedData);
    res.status(HttpStatus.OK).json(successResponse(null, '刪除成功'));
  });
}

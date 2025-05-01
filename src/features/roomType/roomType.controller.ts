import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { QuerySchema } from '@/types/pagination';
import { successResponse } from '@/utils/appResponse';

import { RoomTypeRepo } from './roomType.repo';
import {
  roomTypesCreateSchema,
  roomTypeDto,
  roomTypesDeleteSchema,
  roomTypesListDto,
  roomTypesUpdateSchema,
} from './roomType.schema';

export class RoomTypeController {
  constructor(private roomTypeRepo = new RoomTypeRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = res.locals.brand_id;
    const parsedQuery = QuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const result = await this.roomTypeRepo.getAll(brand_id, currentPage, perPage);
    const dtoData = roomTypesListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房型列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = res.locals.brand_id;
    const roomTypeId = req.params.id;
    const result = await this.roomTypeRepo.getById({ roomTypeId, brandId: brand_id });
    const dtoData = roomTypeDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得飯店房型成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = res.locals.brand_id;
    const validatedData = roomTypesCreateSchema.parse({ ...req.body, brand_id });
    const result = await this.roomTypeRepo.create(validatedData);
    const dtoData = roomTypeDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '創建飯店房型成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = res.locals.brand_id;
    const roomTypeId = req.params.id;
    const validatedData = roomTypesUpdateSchema.parse({ ...req.body, brand_id, id: roomTypeId });
    const result = await this.roomTypeRepo.update(validatedData);
    const dtoData = roomTypeDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新飯店房型成功'));
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = res.locals.brand_id;
    const roomTypeId = req.params.id;
    const validatedData = roomTypesDeleteSchema.parse({ id: roomTypeId, brand_id });
    await this.roomTypeRepo.delete(validatedData);
    res.status(HttpStatus.OK).json(successResponse(null, '刪除成功'));
  });
}

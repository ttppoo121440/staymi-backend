import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { NextFunction } from 'express-serve-static-core';

import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from './storeHotel.repo';
import {
  hotelCreateSchema,
  hotelCreateToDTO,
  hotelGetAllToDTO,
  hotelQuerySchema,
  hotelUpdateSchema,
  hotelUpdateToDTO,
} from './storeHotel.schema';

export class StoreHotelController {
  constructor(private storeHotelRepo: StoreHotelRepo = new StoreHotelRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const brand_id = req.brand_id;
    const parsedQuery = hotelQuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const hotels = await this.storeHotelRepo.getAll(brand_id, currentPage, perPage);
    const dtoDate = hotelGetAllToDTO.parse(hotels);
    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const brand_id = req.brand_id;
    const hotelId = req.params.id;

    const hotelResult = await this.storeHotelRepo.getById({ hotelId, brandId: brand_id });
    if (!hotelResult?.hotel) {
      return next(appError('飯店不存在', HttpStatus.NOT_FOUND));
    }
    const dtoDate = hotelCreateToDTO.parse(hotelResult);
    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店資料成功'));
  });
  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const brand_id = req.brand_id;
    const validatedData = hotelCreateSchema.parse({ ...req.body, brand_id });

    const isNameDuplicateHotel = await this.storeHotelRepo.isNameDuplicate(validatedData.name);
    if (isNameDuplicateHotel) {
      return next(appError('飯店名稱已存在', HttpStatus.CONFLICT));
    }
    const newHotel = await this.storeHotelRepo.create(validatedData);
    const dtoDate = hotelCreateToDTO.parse(newHotel);
    res.status(HttpStatus.CREATED).json(successResponse(dtoDate, '建立飯店成功'));
  });
  update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const brand_id = req.brand_id;
    const hotelId = req.params.id;

    const hotel = await this.storeHotelRepo.getById({ hotelId });
    if (!hotel) {
      return next(appError('飯店不存在', HttpStatus.NOT_FOUND));
    }
    const validatedData = hotelUpdateSchema.parse({ ...req.body, id: hotelId, brand_id });
    const isNameDuplicateHotel = await this.storeHotelRepo.isNameDuplicate(validatedData.name, hotelId);
    if (isNameDuplicateHotel) {
      return next(appError('飯店名稱已存在', HttpStatus.CONFLICT));
    }
    const updatedHotel = await this.storeHotelRepo.update(validatedData);
    const dtoDate = hotelUpdateToDTO.parse(updatedHotel);
    res.status(HttpStatus.OK).json(successResponse(dtoDate, '更新飯店成功'));
  });
}

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { HotelImageRepo } from './hotelImage.repo';
import {
  hotelImagesCreateSchema,
  hotelImagesDeleteSchema,
  hotelImagesDto,
  hotelImagesListDto,
  hotelImagesUpdateSchema,
} from './hotelImage.schema';

export class HotelImageController {
  constructor(private hotelImageRepo = new HotelImageRepo(), private storeHotelRepo = new StoreHotelRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    await this.storeHotelRepo.getById({ hotelId });
    const hotelImages = await this.hotelImageRepo.getAll(hotelId);
    const dtoDate = hotelImagesListDto.parse(hotelImages);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店分館圖片成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.hotelImageRepo.getByHotelId(hotelId);
    const dtoDate = hotelImagesDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店分館圖片成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    const validatedData = hotelImagesCreateSchema.parse({ ...req.body, hotel_id: hotelId });
    const result = await this.hotelImageRepo.create(validatedData);
    const dtoDate = hotelImagesDto.parse(result);

    res.status(HttpStatus.CREATED).json(successResponse(dtoDate, '新增飯店分館圖片成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    const hotelImageId = req.params.id;
    await this.storeHotelRepo.getById({ hotelId });
    await this.hotelImageRepo.getById(hotelImageId);
    const validatedData = hotelImagesUpdateSchema.parse({ ...req.body, id: hotelImageId, hotel_id: hotelId });
    const result = await this.hotelImageRepo.update(validatedData);
    const dtoDate = hotelImagesDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '更新飯店分館圖片成功'));
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    const hotelImageId = req.params.id;
    await this.storeHotelRepo.getById({ hotelId });
    await this.hotelImageRepo.getById(hotelImageId);
    const validatedData = hotelImagesDeleteSchema.parse({ id: hotelImageId, hotel_id: hotelId });
    await this.hotelImageRepo.delete(validatedData);

    res.status(HttpStatus.OK).json(successResponse(null, '刪除成功'));
  });
}

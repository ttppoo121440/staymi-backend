import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { HotelImageRepo } from './hotelImage.repo';
import { hotelImageDto, hotelImageListDto } from './hotelImage.schema';

export class HotelImageController {
  constructor(private hotelImageRepo = new HotelImageRepo(), private storeHotelRepo = new StoreHotelRepo()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    await this.storeHotelRepo.getById({ hotelId });
    const hotelImage = await this.hotelImageRepo.getAll(hotelId);
    const dtoDate = hotelImageListDto.parse(hotelImage);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店分館圖片成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.hotelImageRepo.getByHotelId(hotelId);
    const dtoDate = hotelImageDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '取得飯店分館圖片成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    const result = await this.hotelImageRepo.create({ ...req.body, hotel_id: hotelId });
    const dtoDate = hotelImageDto.parse(result);

    res.status(HttpStatus.CREATED).json(successResponse(dtoDate, '新增飯店分館圖片成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;
    const hotelImageId = req.params.id;

    await this.storeHotelRepo.getById({ hotelId });
    await this.hotelImageRepo.getById(hotelImageId);
    const result = await this.hotelImageRepo.update({ ...req.body, id: hotelImageId, hotel_id: hotelId });
    const dtoDate = hotelImageDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoDate, '更新飯店分館圖片成功'));
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;
    const hotelImageId = req.params.id;

    await this.storeHotelRepo.getById({ hotelId });
    await this.hotelImageRepo.getById(hotelImageId);
    await this.hotelImageRepo.delete({ id: hotelImageId, hotel_id: hotelId });

    res.status(HttpStatus.OK).json(successResponse(null, '刪除成功'));
  });
}

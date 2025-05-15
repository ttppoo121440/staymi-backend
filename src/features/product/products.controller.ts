import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { ProductsRepo } from './products.repo';
import { productsDto, productsListDto } from './products.schema';

export class ProductsController {
  constructor(private productsRepo = new ProductsRepo(), private storeHotelRepo = new StoreHotelRepo()) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.productsRepo.getAll(hotelId);
    const dtoData = productsListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得伴手禮列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;
    const id = req.params.id;

    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.productsRepo.getById(id, hotelId);
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得伴手禮成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;

    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.productsRepo.create({ ...req.body, hotel_id: hotelId });
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '新增伴手禮成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;
    const id = req.params.id;

    await this.storeHotelRepo.getById({ hotelId });
    await this.productsRepo.getById(id, hotelId);
    const result = await this.productsRepo.update({ ...req.body, hotel_id: hotelId, id });
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新伴手禮成功'));
  });
  softDelete = asyncHandler(async (req: Request, res: Response) => {
    const { hotel_id: hotelId } = res.locals;
    const id = req.params.id;

    await this.storeHotelRepo.getById({ hotelId });
    const { is_active } = await this.productsRepo.selectIsActive(id, hotelId);
    await this.productsRepo.softDelete(id, hotelId, !is_active);
    const message = is_active ? '還原伴手禮成功' : '刪除伴手禮成功';
    res.status(200).json(successResponse(null, message));
  });
}

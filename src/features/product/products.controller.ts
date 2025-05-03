import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { successResponse } from '@/utils/appResponse';

import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { ProductsRepo } from './products.repo';
import { productsCreateSchema, productsDto, productsListDto, productsUpdateSchema } from './products.schema';

export class ProductsController {
  constructor(private productsRepo = new ProductsRepo(), private storeHotelRepo = new StoreHotelRepo()) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.productsRepo.getAll(hotelId);
    const dtoData = productsListDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得伴手禮列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    const id = req.params.id;
    await this.storeHotelRepo.getById({ hotelId });
    const result = await this.productsRepo.getById(id, hotelId);
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得伴手禮成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    await this.storeHotelRepo.getById({ hotelId });
    const validatedData = productsCreateSchema.parse({ ...req.body, hotel_id: hotelId });
    const result = await this.productsRepo.create(validatedData);
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.CREATED).json(successResponse(dtoData, '新增伴手禮成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId;
    const id = req.params.id;
    await this.storeHotelRepo.getById({ hotelId });
    await this.productsRepo.getById(id, hotelId);
    const validatedData = productsUpdateSchema.parse({ ...req.body, hotel_id: hotelId, id });
    const result = await this.productsRepo.update(validatedData);
    const dtoData = productsDto.parse(result);
    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新伴手禮成功'));
  });
}

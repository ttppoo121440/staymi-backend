import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { NextFunction } from 'express-serve-static-core';

import { HttpStatus } from '@/types/http-status.enum';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { HotelSearchRepo } from './hotelSearch.repo';

export class HotelSearchController {
  constructor(private hotelSearchRepo: HotelSearchRepo = new HotelSearchRepo()) {}

  getHotelSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    if (!name || typeof name != 'string') {
      return next(appError('請提供 name 字串', HttpStatus.BAD_REQUEST));
    }

    const result = await this.hotelSearchRepo.getHotelInputSuggestion(name);

    res.status(HttpStatus.OK).json(successResponse(result, '取得飯店建議成功'));
  });

  getAllHotelsPlan = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = QuerySchema.parse(req.query);
    const { currentPage, perPage } = parsedQuery;
    const result = await this.hotelSearchRepo.getAllHotelsPlan(currentPage, perPage);
    res.status(HttpStatus.OK).json(successResponse(result, '飯店檢索成功'));
  });
}

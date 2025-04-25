import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';

import { UserRepo } from './user.repo';
import { user_profileToDTO, user_profileUpdateSchema, user_profileUpdateToDTO } from './user.schema';

export class UserController {
  constructor(private userRepo: UserRepo = new UserRepo()) {}
  getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const userProfile = await this.userRepo.getById(userId);
    const validatedData = user_profileToDTO.parse(userProfile);
    res.status(HttpStatus.OK).json(successResponse(validatedData, '獲取個人資料成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const id: string = (req.user as JwtUserPayload).id;
    const validatedData = user_profileUpdateSchema.parse({ id, ...req.body });
    const updatedUserProfile = await this.userRepo.update(validatedData);
    const dtoData = user_profileUpdateToDTO.parse(updatedUserProfile);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新個人資料成功'));
  });
}

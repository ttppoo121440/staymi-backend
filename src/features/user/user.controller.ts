import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';

import { UserRepo } from './user.repo';
import {
  user_profileToDTO,
  user_profileUpdateAvatarSchema,
  user_profileUpdateAvatarToDTO,
  user_profileUpdateSchema,
  user_profileUpdateToDTO,
} from './user.schema';

export class UserController {
  constructor(private userRepo: UserRepo = new UserRepo()) {}
  getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const result = await this.userRepo.getById(userId);
    const validatedData = user_profileToDTO.parse(result);
    res.status(HttpStatus.OK).json(successResponse(validatedData, '獲取個人資料成功'));
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const id: string = (req.user as JwtUserPayload).id;
    const validatedData = user_profileUpdateSchema.parse({ id, ...req.body });
    const result = await this.userRepo.update(validatedData);
    const dtoData = user_profileUpdateToDTO.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新個人資料成功'));
  });
  uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const id: string = (req.user as JwtUserPayload).id;
    const validatedData = user_profileUpdateAvatarSchema.parse({ id: id, ...req.body });
    const result = await this.userRepo.uploadAvatar(validatedData);
    const dtoData = user_profileUpdateAvatarToDTO.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新成功'));
  });
}

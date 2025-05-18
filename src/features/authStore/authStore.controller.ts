import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';

import { AuthRepo } from '../auth/auth.repo';

import { AuthStoreRepo } from './authStore.repo';
import { authStoreToDto } from './authStore.schema';

export class AuthStoreController {
  constructor(private authStoreRepo = new AuthStoreRepo(), private authRepo = new AuthRepo()) {}

  signup = asyncHandler(async (req: Request, res: Response) => {
    const newStore = await this.authStoreRepo.signup(req.body);
    const token = await this.authStoreRepo.storeLogin({ email: newStore.email, password: req.body.password });
    const result = await this.authRepo.getUserByEmail(newStore.email);
    const responseData = {
      token,
      user: {
        name: result.name,
        avatar: result.avatar,
      },
    };
    res.status(HttpStatus.CREATED).json(successResponse(responseData, '註冊成功'));
  });

  storeLogin = asyncHandler(async (req: Request, res: Response) => {
    const token = await this.authStoreRepo.storeLogin(req.body);
    const result = await this.authRepo.getUserByEmail(req.body.email);
    const responseData = {
      token,
      user: {
        name: result.name,
        avatar: result.avatar,
      },
    };
    res.status(HttpStatus.OK).json(successResponse(responseData, '登入成功'));
  });

  updateStoreInfo = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const result = await this.authStoreRepo.updateStoreInfo(userId, req.body);
    const dtoData = authStoreToDto.parse(result);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新成功'));
  });

  uploadLogo = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = res.locals;
    const result = await this.authStoreRepo.uploadLogo(user_id, req.body);

    res.status(HttpStatus.OK).json(successResponse(result, '上傳成功'));
  });
}

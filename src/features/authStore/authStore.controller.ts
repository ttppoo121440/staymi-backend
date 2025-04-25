import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { successResponse } from '@/utils/appResponse';

import { AuthRepo } from '../auth/auth.repo';
import { AuthLoginSchema } from '../auth/auth.schema';

import { AuthStoreRepo } from './authStore.repo';
import {
  authStoreSignupSchema,
  authStoreUpdateSchema,
  authStoreUpdateToDTO,
  authStoreUploadLogoSchema,
} from './authStore.schema';

export class AuthStoreController {
  constructor(private authStoreRepo = new AuthStoreRepo(), private authRepo = new AuthRepo()) {}

  signup = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = authStoreSignupSchema.parse(req.body);
    const newStore = await this.authStoreRepo.signup(validatedData);
    const token = await this.authStoreRepo.storeLogin({ email: newStore.email, password: validatedData.password });
    const userInfo = await this.authRepo.getUserByEmail(newStore.email);
    const responseData = {
      token,
      user: {
        name: userInfo.name,
        avatar: userInfo.avatar,
      },
    };
    res.status(HttpStatus.CREATED).json(successResponse(responseData, '註冊成功'));
  });

  storeLogin = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = AuthLoginSchema.parse(req.body);
    const token = await this.authStoreRepo.storeLogin(validatedData);
    const userInfo = await this.authRepo.getUserByEmail(validatedData.email);
    const responseData = {
      token,
      user: {
        name: userInfo.name,
        avatar: userInfo.avatar,
      },
    };
    res.status(HttpStatus.OK).json(successResponse(responseData, '登入成功'));
  });

  updateStoreInfo = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = authStoreUpdateSchema.parse(req.body);
    const userId: string = (req.user as JwtUserPayload).id;
    const updatedUser = await this.authStoreRepo.updateStoreInfo(userId, validatedData);
    const dtoData = authStoreUpdateToDTO.parse(updatedUser);

    res.status(HttpStatus.OK).json(successResponse(dtoData, '更新成功'));
  });

  uploadLogo = asyncHandler(async (req: Request, res: Response) => {
    const id: string = (req.user as JwtUserPayload).id;
    const validatedData = authStoreUploadLogoSchema.parse({ id: id, ...req.body });
    const updatedUser = await this.authStoreRepo.uploadLogo(validatedData);

    res.status(HttpStatus.OK).json(successResponse(updatedUser, '上傳成功'));
  });
}

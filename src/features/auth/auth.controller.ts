import type { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';

import { AuthRepo } from './auth.repo';
import { authCreateToDTO, AuthLoginSchema, AuthUpdatePasswordSchema } from './auth.schema';

export class AuthController {
  constructor(private authRepo = new AuthRepo()) {}

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = AuthLoginSchema.parse(req.body);

    if (!validatedData.email || !validatedData.password) {
      next(appError('請輸入信箱與密碼', HttpStatus.BAD_REQUEST));
    }

    const token = await this.authRepo.login(validatedData);
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

  signup = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = authCreateToDTO.parse(req.body);
    const newUser = await this.authRepo.signup(validatedData);
    const token = await this.authRepo.login({ email: newUser.email, password: validatedData.password });
    const userInfo = await this.authRepo.getUserByEmail(newUser.email);
    const responseData = {
      token,
      user: {
        name: userInfo.name,
        avatar: userInfo.avatar,
      },
    };
    res.status(HttpStatus.CREATED).json(successResponse(responseData, '註冊成功'));
  });
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id: string = (req.user as JwtUserPayload).id;
    if (!id) {
      next(appError('用戶不存在', HttpStatus.NOT_FOUND));
    }
    const validatedData = AuthUpdatePasswordSchema.parse({ ...req.body, id });

    if (!validatedData.oldPassword || !validatedData.newPassword) {
      next(appError('請提供舊密碼和新密碼', HttpStatus.BAD_REQUEST));
    }

    await this.authRepo.changePassword(validatedData);
    res.status(HttpStatus.OK).json(successResponse(null, '密碼已更新'));
  });
}

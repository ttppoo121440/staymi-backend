import type { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { env, frontendUrl, serverUrl } from '@/config/env';
import getRedisClient from '@/config/redisClient';
import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import { generateToken } from '@/utils/jwt';

import { AuthRepo } from './auth.repo';
import { authCreateToDTO, AuthLoginSchema, AuthUpdatePasswordSchema } from './auth.schema';
import { AuthService } from './auth.service';
import { LineIdTokenProfileType } from './auth.types';

export class AuthController {
  constructor(private authRepo = new AuthRepo(), private authService = new AuthService()) {}

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
  redirectToLine = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = env.LINE_CHANNEL_ID;
    const redirectUri = encodeURIComponent(serverUrl + 'api/v1/users/line/callback'); //透過 encodeURIComponent 確保 URL 可以正確解析

    const redirectTo = req.query.redirectTo as string;

    if (!redirectTo.startsWith('/')) {
      return next(appError('導向路徑不正確', HttpStatus.BAD_REQUEST));
    }

    const state = uuid();

    const client = await getRedisClient();
    await client.set(`line:state:${state}`, redirectTo, { EX: 300 });

    const scope = 'profile openid email';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    res.redirect(lineAuthUrl);
  });
  handleLineCallback = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return next(appError('缺少 code', HttpStatus.BAD_REQUEST));
    }

    const client = await getRedisClient();
    const redirectTo = await client.get(`line:state:${state}`);

    if (!redirectTo) {
      return next(appError('無效或過期的 state', HttpStatus.FORBIDDEN));
    }

    await client.del(`line:state:${state}`);

    const { access_token, id_token } = await this.authService.getLineToken(code);
    const providerId = await this.authService.getLineUserId(access_token);

    let userInfo = await this.authRepo.findUserByProviderId(providerId);

    if (!userInfo) {
      const idTokenProfile = jwt.decode(id_token);

      if (!idTokenProfile || typeof idTokenProfile === 'string') {
        return next(appError('解析 id_token 失敗', HttpStatus.UNAUTHORIZED));
      }

      const { sub: providerId, name, picture: avatar, email } = idTokenProfile as LineIdTokenProfileType;

      userInfo = await this.authRepo.createByProvider({ provider: 'line', providerId, name, avatar, email });
    }

    const userToken = generateToken({
      id: userInfo.id,
      role: userInfo.role,
    });

    return res.redirect(
      `${frontendUrl}callback?pathname=${encodeURIComponent(redirectTo)}&token=${userToken}&name=${
        userInfo.name
      }&avatar=${encodeURIComponent(userInfo.avatar)}`,
    );
  });
}

import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';

export const authMiddleware = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw appError('未登入或 token 失效', HttpStatus.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    throw new Error('環境變數中未定義 JWT_SECRET');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload;
  req.user = decoded;
  res.locals.user_id = decoded.id;
  req.body.user_id = decoded.id;
  next();
});

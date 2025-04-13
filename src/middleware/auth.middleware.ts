import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpStatus } from '@/types/http-status.enum';
import { errorResponse } from '@/utils/appResponse';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(HttpStatus.UNAUTHORIZED).json(errorResponse('請提供有效的 Bearer Token'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('環境變數中未定義 JWT_SECRET');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded as { id: string; email: string };
    next();
  } catch (error) {
    console.error('Token 解析錯誤:', error);
    res.status(HttpStatus.UNAUTHORIZED).json(errorResponse('無效的 Token'));
  }
};

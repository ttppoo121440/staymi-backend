import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpStatus } from '@/types/http-status.enum';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(HttpStatus.UNAUTHORIZED).json({ status: 'error', message: '未提供授權標頭' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('環境變數中未定義 JWT_SECRET');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded as { id: number; email: string; role: string };
    next();
  } catch (error) {
    console.error('Token 解析錯誤:', error);
    res.status(HttpStatus.UNAUTHORIZED).json({ status: 'error', message: '無效的 Token' });
  }
};

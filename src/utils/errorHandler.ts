import type { Request, Response, NextFunction } from 'express';

import { HttpStatus } from '@/types/http-status.enum';

import type { AppError } from '../types/AppErrorType';
import logger from '../utils/logger';

// 捕捉 JSON 解析錯誤的中介軟體
export const jsonParseErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && err.statusCode === 400 && 'body' in err) {
    console.error('JSON 解析錯誤:', err);
    res.status(HttpStatus.BAD_REQUEST).json({
      status: 'error',
      message: '傳入的 JSON 格式錯誤，請檢查逗號或引號是否正確',
    });
    return;
  }
  next();
};

// 全域錯誤處理中介軟體
export const globalErrorHandler = (err: AppError, req: Request, res: Response, _: NextFunction): void => {
  err.statusCode = err.statusCode ?? 500;

  logger.error(`${err.statusCode} :${req.path}-${err.message}`);

  // 確保 res 是有效的 Express Response 物件
  if (typeof res.status !== 'function' || typeof res.setHeader !== 'function') {
    console.error('res 物件無效，可能不是 Express 的 Response 物件:', res);
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  if (process.env.NODE_ENV === 'dev') {
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

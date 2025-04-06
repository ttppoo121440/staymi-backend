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
export const globalErrorHandler = (err: AppError, req: Request, res: Response): void => {
  err.statusCode = err.statusCode ?? 500;

  logger.error(`${err.statusCode} :${req.path}-${err.message}`);
  res.setHeader('Content-Type', 'application/json'); // 確保回傳 JSON
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

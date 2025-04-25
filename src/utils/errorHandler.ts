import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import type { AppErrorType } from '@/types/AppErrorType';
import { HttpStatus } from '@/types/http-status.enum';

import { RepoError } from './appError';
import logger from './logger';

// 捕捉 JSON 解析錯誤的中介軟體
export const jsonParseErrorHandler = (err: AppErrorType, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && err.statusCode === 400 && 'body' in err) {
    console.error('JSON 解析錯誤:', err);
    res.status(HttpStatus.BAD_REQUEST).json({
      status: 'error',
      message: '傳入的 JSON 格式錯誤，請檢查逗號或引號是否正確',
    });
    return;
  }
  next(err);
};

// 全域錯誤處理中介軟體
export const globalErrorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (res.headersSent) return;
  if (err instanceof RepoError) {
    logger.error('儲存庫錯誤:', err);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  } else if (err instanceof ZodError) {
    logger.error('zod 錯誤', err);
    const firstErrorMessage = err.errors[0]?.message || '輸入資料格式錯誤';
    res.status(400).json({
      success: false,
      message: firstErrorMessage,
      data: null,
    });
    return;
  }
  logger.error('💥 伺服器錯誤:', err);

  res.status(500).json({
    success: false,
    message: '伺服器發生錯誤，請稍後再試',
    data: null,
  });
};

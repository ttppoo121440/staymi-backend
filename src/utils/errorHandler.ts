import type { Request, Response, NextFunction } from 'express';

import type { AppErrorType } from '@/types/AppErrorType';
import { HttpStatus } from '@/types/http-status.enum';

import { AppErrorClass } from './appError';

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
  if (err instanceof AppErrorClass) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  } else {
    console.error('💥 Unexpected Error:', err);

    res.status(500).json({
      success: false,
      message: '伺服器發生錯誤，請稍後再試',
      data: null,
    });
  }
};

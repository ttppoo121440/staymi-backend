import type { Request, Response, NextFunction } from 'express';

import type { ApiResponse } from '@/types/ApiResponseType';
import type { AppError } from '@/types/AppErrorType';

import { ErrorCode, ErrorStatus } from './errorCode';
import logger from './logger';

export const successResponse = <T>(data: T, message = '請求成功'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export function errorResponse<T = null>(message: string, data: T = null as T): ApiResponse<T> {
  return {
    success: false,
    message,
    data,
  };
}

/**
 * Sends a 404 Not Found JSON response for undefined routes.
 *
 * 當請求的路由不存在時，此函式會回傳 404 錯誤的 JSON 回應，並記錄錯誤資訊。
 *
 * @param {Request} req - Express 請求物件。
 * @param {Response} res - Express 回應物件。
 */
export const NotFound = (req: Request, res: Response): void => {
  logger.error(`[${req.method}] 404 : ${req.path}`);
  res.status(404).json(errorResponse('查無此路由，請確認 API 格式!'));
};

/**
 * Creates an application error and passes it to the next middleware.
 *
 * 此函式用來產生一個包含自訂訊息與狀態碼的錯誤，並將該錯誤傳遞給 Express 的錯誤處理中介軟體。
 *
 * @param {string} errMessage - 錯誤訊息。
 * @param {NextFunction} next - Express 的 next 函式，用於傳遞錯誤至下一個中介軟體。
 * @param {number} [httpStatus=400] - HTTP 狀態碼（預設為 400）。
 */
export const appError = (errMessage: string, next: NextFunction, httpStatus = 400): void => {
  const error = new Error(errMessage) as AppError;
  error.statusCode = httpStatus;
  error.isOperational = true;
  error.status = httpStatus == 500 ? ErrorStatus[ErrorCode.INTERNAL_SERVER_ERROR] : ErrorStatus[ErrorCode.BAD_REQUEST];

  next(error);
};

import type { Request, Response } from 'express';

import type { ApiResponse } from '@/types/ApiResponseType';

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
  res.status(404).json({
    success: false,
    message: '查無此路由，請確認 API 格式!',
    data: null,
  });
};

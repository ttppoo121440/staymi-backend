import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * 包裝非同步 Express 處理器，捕捉錯誤並傳遞給 next() 處理。
 *
 * @param {AsyncRequestHandler} func - 非同步處理器
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} 包裝後的函式
 */
const handleErrorAsync = (func: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(func(req, res, next)).catch(next);

export default handleErrorAsync;

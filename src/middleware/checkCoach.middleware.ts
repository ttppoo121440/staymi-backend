import type { Request, Response, NextFunction } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import type { JwtUserPayload } from '@/types/JwtUserPayload';
import { errorResponse } from '@/utils/appResponse';

export const checkCoachMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as JwtUserPayload;

  if (user.role !== 'COACH') {
    res.status(HttpStatus.FORBIDDEN).json(errorResponse('無權限訪問此資源'));
    return;
  }
  next();
};

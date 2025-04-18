import type { Request, Response, NextFunction } from 'express';

import { Role } from '@/features/auth/auth.schema';
import { HttpStatus } from '@/types/http-status.enum';
import { errorResponse } from '@/utils/appResponse';

export const checkRolesMiddleware = (
  allowedRoles: Role[],
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as { role: Role };

    if (!allowedRoles.includes(user.role)) {
      res.status(HttpStatus.FORBIDDEN).json(errorResponse('無權限訪問此資源'));
      return;
    }

    next();
  };
};

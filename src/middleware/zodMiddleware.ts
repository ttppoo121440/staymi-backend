import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ZodSchema } from 'zod';

type SchemaConfig = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const zodMiddleware = (schemas: SchemaConfig): ((req: Request, res: Response, next: NextFunction) => void) =>
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    next();
  });

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { z, ZodObject, ZodRawShape, ZodSchema } from 'zod';

type SchemaConfig = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodObject<ZodRawShape>;
};

//接收指定要驗證的 params 內容並將其轉為 schema
export const uuidParams = (...keys: string[]): ZodObject<ZodRawShape> =>
  z.object(Object.fromEntries(keys.map((key) => [key, z.string().uuid({ message: `${key} 格式錯誤` })])));

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

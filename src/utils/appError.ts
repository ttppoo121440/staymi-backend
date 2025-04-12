import type { NextFunction } from 'express';

export class AppErrorClass extends Error {
  statusCode: number;
  status: 'fail' | 'error';
  isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const appError = (message: string, next: NextFunction, statusCode = 400): void => {
  const error = new AppErrorClass(message, statusCode);
  next(error);
};

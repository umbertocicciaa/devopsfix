import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError, MethodNotAllowedError, NotFoundError, toAppError } from '../utils/AppError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route not found: ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError: AppError = toAppError(err);

  if (process.env.NODE_ENV !== 'test') {
    const context = {
      path: req.path,
      method: req.method,
      statusCode: appError.statusCode,
      code: appError.code,
      details: appError.details
    };
    if (appError.isOperational) {
      console.warn('Handled error:', appError.message, context);
    } else {
      console.error('Unhandled error:', appError, context);
    }
  }

  const responseBody: {
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
  } = {
    error: {
      code: appError.code,
      message: appError.isOperational ? appError.message : 'Internal server error'
    }
  };

  if (appError.details !== undefined) {
    responseBody.error.details = appError.details;
  }

  const statusCode = appError.isOperational ? appError.statusCode : 500;

  res.status(statusCode).json(responseBody);
};

export const methodNotAllowedHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new MethodNotAllowedError('Method not allowed'));
};

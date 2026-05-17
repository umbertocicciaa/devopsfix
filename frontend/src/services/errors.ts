import axios from 'axios';
import { APP_COPY } from '../config/appCopy';
import { ERROR_CODES } from '../config/appConfig';

export type AppErrorDetails = Record<string, unknown> | string | undefined;

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: string;
  details?: AppErrorDetails;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: AppErrorDetails;
  public readonly isOperational: boolean;

  constructor({ message, statusCode = 500, code = ERROR_CODES.internal, details, isOperational }: AppErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational ?? statusCode < 500;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 400, code: ERROR_CODES.badRequest, details, isOperational: true });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 422, code: ERROR_CODES.validation, details, isOperational: true });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 404, code: ERROR_CODES.notFound, details, isOperational: true });
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 500, code: ERROR_CODES.configuration, details, isOperational: true });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: AppErrorDetails, statusCode = 502) {
    super({ message, statusCode, code: ERROR_CODES.externalService, details });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function extractAxiosMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  if (typeof error.response?.data === 'string') {
    return error.response.data;
  }

  const responseError = error.response?.data as
    | { error?: { message?: string } | string }
    | undefined;

  if (responseError?.error) {
    if (typeof responseError.error === 'string') {
      return responseError.error;
    }
    if (typeof responseError.error.message === 'string') {
      return responseError.error.message;
    }
  }

  return error.message;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const axiosMessage = extractAxiosMessage(error);
  if (axiosMessage) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return new ExternalServiceError(axiosMessage, { status });
  }

  if (error instanceof Error) {
    return new AppError({ message: error.message });
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return new AppError({ message: error });
  }

  try {
    const stringified = JSON.stringify(error);
    if (stringified && stringified !== '{}') {
      return new AppError({ message: stringified });
    }
  } catch {
    // ignore serialization errors
  }

  return new AppError({ message: APP_COPY.errors.unexpectedError });
}

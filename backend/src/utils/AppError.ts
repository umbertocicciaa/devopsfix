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

  constructor({ message, statusCode = 500, code = 'internal_error', details, isOperational }: AppErrorOptions) {
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
    super({ message, statusCode: 400, code: 'bad_request', details, isOperational: true });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 422, code: 'validation_error', details, isOperational: true });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 404, code: 'not_found', details, isOperational: true });
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 500, code: 'configuration_error', details, isOperational: true });
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super({ message, statusCode: 405, code: 'method_not_allowed', details, isOperational: true });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: AppErrorDetails, statusCode = 502) {
    super({ message, statusCode, code: 'external_service_error', details });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
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
    // Ignore JSON serialization errors
  }

  return new AppError({ message: 'An unexpected error occurred.' });
}

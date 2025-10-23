import axios from 'axios';

export interface ApiErrorPayload {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: unknown;

  constructor({ code, message, status, details }: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function extractErrorPayload(error: unknown): ApiErrorPayload {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details
    };
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const fallbackMessage = error.message || 'Unexpected error contacting server.';

    if (error.response?.data && typeof error.response.data === 'object') {
      const payload = (error.response.data as { error?: unknown }).error;

      if (
        payload &&
        typeof payload === 'object' &&
        'message' in payload &&
        typeof (payload as { message: unknown }).message === 'string'
      ) {
        const typedPayload = payload as { code?: string; message: string; details?: unknown };

        return {
          code: typeof typedPayload.code === 'string' ? typedPayload.code : 'server_error',
          message: typedPayload.message,
          status,
          details: typedPayload.details
        };
      }
    }

    return {
      code: status && status >= 500 ? 'server_error' : 'request_failed',
      message: fallbackMessage,
      status
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unexpected_error',
      message: error.message
    };
  }

  return {
    code: 'unexpected_error',
    message: 'Unexpected error contacting server.'
  };
}

export function toApiError(error: unknown): ApiError {
  const payload = extractErrorPayload(error);
  return new ApiError(payload);
}

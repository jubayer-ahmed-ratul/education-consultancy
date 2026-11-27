import type { Response } from 'express';
import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse, PaginationMeta } from '@zero-compile/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): Response<ApiSuccessResponse<T>> {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[]
): Response<ApiErrorResponse> {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}

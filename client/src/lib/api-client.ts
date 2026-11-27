import type { ApiErrorDetail, ApiResponse, PaginationMeta } from '@zero-compile/shared';

const rawBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  '';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = `${BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !json || !json.success) {
    const err = json && !json.success ? json.error : null;
    throw new ApiClientError(
      response.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? `Request failed with status ${response.status}`,
      err?.details
    );
  }

  return {
    data: json.data,
    meta: json.meta,
  };
}

import type { ApiErrorDetail, ApiResponse, PaginationMeta } from '@zero-compile/shared';

const rawBaseUrl = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    '';
const BASE_URL = rawBaseUrl.trim().replace(/\/+$/, '').replace(/\/api$/i, '');

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

const inflightGets = new Map<string, Promise<ApiResult<unknown>>>();
const swrCache = new Map<string, { result: ApiResult<unknown>; timestamp: number }>();
const SWR_MAX_AGE_MS = 5 * 60 * 1000;

function isPublicCacheablePath(path: string): boolean {
  return (
    path.startsWith('/content/') ||
    path.startsWith('/countries') ||
    path.startsWith('/universities') ||
    path.startsWith('/blogs') ||
    path.startsWith('/events') ||
    path.startsWith('/whatsapp')
  ) && !path.includes('/admin/');
}

async function executeFetch<T>(url: string, options: RequestInit): Promise<ApiResult<T>> {
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

function fetchWithDedup<T>(url: string, options: RequestInit, cacheKey?: string): Promise<ApiResult<T>> {
  const existing = inflightGets.get(url) as Promise<ApiResult<T>> | undefined;
  if (existing) return existing;

  const promise = executeFetch<T>(url, options)
    .then((res) => {
      if (cacheKey) {
        swrCache.set(cacheKey, { result: res, timestamp: Date.now() });
      }
      return res;
    })
    .finally(() => {
      inflightGets.delete(url);
    });

  inflightGets.set(url, promise as Promise<ApiResult<unknown>>);
  return promise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}/api${normalizedPath}`;
  const method = (options.method || 'GET').toUpperCase();

  if (method === 'GET') {
    const cacheable = isPublicCacheablePath(normalizedPath);
    if (cacheable) {
      const cached = swrCache.get(normalizedPath);
      if (cached && Date.now() - cached.timestamp < SWR_MAX_AGE_MS) {
        // Return immediately and revalidate silently in background
        void fetchWithDedup<T>(url, options, normalizedPath).catch(() => undefined);
        return cached.result as ApiResult<T>;
      }
    }
    return fetchWithDedup<T>(url, options, cacheable ? normalizedPath : undefined);
  }

  // Invalidate client SWR cache on mutations
  swrCache.clear();
  return executeFetch<T>(url, options);
}

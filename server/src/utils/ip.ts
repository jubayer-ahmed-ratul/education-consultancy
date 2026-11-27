import { isIP } from 'node:net';
import type { Request } from 'express';
import { env } from '../config/env';
import { AppError } from './AppError';

function firstHeaderValue(val: string | string[] | undefined): string | null {
  if (!val) return null;
  const raw = Array.isArray(val) ? val[0] : val;
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim();
  return first || null;
}

function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const cleaned = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  return isIP(cleaned) !== 0 ? cleaned : null;
}

export function extractClientIp(req: Request): string {
  let candidate: string | null = null;

  if (env.TRUST_PROXY === 'cloudflare') {
    candidate = firstHeaderValue(req.headers['cf-connecting-ip']);
  } else if (env.TRUST_PROXY === 'vercel') {
    candidate =
      firstHeaderValue(req.headers['x-real-ip']) ??
      firstHeaderValue(req.headers['x-forwarded-for']);
  } else if (env.TRUST_PROXY === 'true') {
    candidate =
      firstHeaderValue(req.headers['cf-connecting-ip']) ??
      firstHeaderValue(req.headers['x-real-ip']) ??
      firstHeaderValue(req.headers['x-forwarded-for']);
  }

  const resolved = normalizeIp(candidate) ?? normalizeIp(req.ip) ?? normalizeIp(req.socket?.remoteAddress);

  if (!resolved) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(400, 'INVALID_CLIENT_IP', 'Unable to resolve a valid client IP address.');
    }
    return '127.0.0.1';
  }

  return resolved;
}

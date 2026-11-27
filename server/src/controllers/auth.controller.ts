import type { NextFunction, Request, Response } from 'express';
import type { LoginInput } from '@zero-compile/shared';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { extractClientIp } from '../utils/ip';
import { sendSuccess } from '../utils/response';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const ipAddress = extractClientIp(req);
      const { user, token } = await authService.login(email, password, ipAddress);

      res.cookie(env.COOKIE_NAME, token, getCookieOptions());
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = extractClientIp(req);
      await authService.logout(req.user?.id, ipAddress);

      const isProd = env.NODE_ENV === 'production';
      res.clearCookie(env.COOKIE_NAME, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
      });
      sendSuccess(res, { message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },
};

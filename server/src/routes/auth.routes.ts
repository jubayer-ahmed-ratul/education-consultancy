import { Router } from 'express';
import { loginSchema } from '@zero-compile/shared';
import { authController } from '../controllers/auth.controller';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rate-limit.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.post(
  '/login',
  rateLimit({ scope: 'auth-login', windowMs: 15 * 60 * 1000, limit: 10 }),
  validateBody(loginSchema),
  authController.login
);

router.post('/logout', optionalAuth, authController.logout);

router.get('/me', requireAuth, authController.me);

export { router as authRoutes };

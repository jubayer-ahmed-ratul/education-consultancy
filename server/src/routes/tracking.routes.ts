import { Router } from 'express';
import {
  requestRecoverySchema,
  trackInquirySchema,
  verifyRecoverySchema,
} from '@zero-compile/shared';
import { trackingController } from '../controllers/tracking.controller';
import { rateLimit } from '../middlewares/rate-limit.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.post(
  '/track',
  rateLimit({ scope: 'inquiry-track', windowMs: 15 * 60 * 1000, limit: 30 }),
  validateBody(trackInquirySchema),
  trackingController.track
);

router.post(
  '/recover/request',
  rateLimit({ scope: 'inquiry-recover-req', windowMs: 15 * 60 * 1000, limit: 5 }),
  validateBody(requestRecoverySchema),
  trackingController.requestRecovery
);

router.post(
  '/recover/verify',
  rateLimit({ scope: 'inquiry-recover-verify', windowMs: 15 * 60 * 1000, limit: 5 }),
  validateBody(verifyRecoverySchema),
  trackingController.verifyRecovery
);

export { router as trackingRoutes };

import { Router } from 'express';
import { uploadSignatureSchema } from '@zero-compile/shared';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.post(
  '/signature',
  requireAuth,
  requireRole('admin', 'super-admin'),
  validateBody(uploadSignatureSchema),
  uploadController.createSignature
);

export { router as uploadRoutes };

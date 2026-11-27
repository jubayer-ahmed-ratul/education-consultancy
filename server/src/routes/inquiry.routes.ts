import { Router } from 'express';
import { z } from 'zod';
import {
  addInquiryNoteSchema,
  assignInquirySchema,
  inquiryListQuerySchema,
  publicSubmitInquirySchema,
  updateInquiryStatusSchema,
  uuidSchema,
} from '@zero-compile/shared';
import { inquiryController } from '../controllers/inquiry.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rate-limit.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';

const router = Router();

const idParamSchema = z.object({ id: uuidSchema });
const docParamSchema = z.object({ id: uuidSchema, docId: uuidSchema });
const addDocumentSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(100),
  storageKey: z.string().trim().min(1).max(500),
});

// Public inquiry submission (10 submissions per IP per hour)
router.post(
  '/',
  rateLimit({ scope: 'inquiry-submit', windowMs: 60 * 60 * 1000, limit: 10 }),
  validateBody(publicSubmitInquirySchema),
  inquiryController.submitPublic
);

// Protected Admin & Super Admin inquiry endpoints
router.get(
  '/',
  requireAuth,
  requirePermission('inquiries:view-all'),
  validateQuery(inquiryListQuerySchema),
  inquiryController.list
);

router.get(
  '/:id',
  requireAuth,
  requirePermission('inquiries:view-all'),
  validateParams(idParamSchema),
  inquiryController.getById
);

router.put(
  '/:id/status',
  requireAuth,
  requirePermission('inquiries:update-status'),
  validateParams(idParamSchema),
  validateBody(updateInquiryStatusSchema),
  inquiryController.updateStatus
);

router.post(
  '/:id/notes',
  requireAuth,
  requirePermission('inquiries:add-notes'),
  validateParams(idParamSchema),
  validateBody(addInquiryNoteSchema),
  inquiryController.addNote
);

router.post(
  '/:id/assign',
  requireAuth,
  requirePermission('inquiries:assign'),
  validateParams(idParamSchema),
  validateBody(assignInquirySchema),
  inquiryController.assign
);

router.put(
  '/:id/assign',
  requireAuth,
  requirePermission('inquiries:assign'),
  validateParams(idParamSchema),
  validateBody(assignInquirySchema),
  inquiryController.assign
);

router.post(
  '/:id/documents',
  requireAuth,
  requirePermission('inquiries:update-status'),
  validateParams(idParamSchema),
  validateBody(addDocumentSchema),
  inquiryController.addDocument
);

router.delete(
  '/:id/documents/:docId',
  requireAuth,
  requirePermission('inquiries:update-status'),
  validateParams(docParamSchema),
  inquiryController.removeDocument
);

export { router as inquiryRoutes };

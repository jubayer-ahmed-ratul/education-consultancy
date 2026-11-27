import { Router } from 'express';
import { authRoutes } from './auth.routes';
import {
  auditRoutes,
  cmsRoutes,
  countryAdminRouter,
  revalidateRoutes,
  universityAdminRouter,
} from './cms.routes';
import { healthRoutes } from './health.routes';
import { inquiryRoutes } from './inquiry.routes';
import { publicRoutes } from './public.routes';
import { trackingRoutes } from './tracking.routes';
import { uploadRoutes } from './upload.routes';
import { userRoutes } from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/inquiries', trackingRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/uploads', uploadRoutes);
router.use('/countries', countryAdminRouter);
router.use('/universities', universityAdminRouter);
router.use('/admin/content', cmsRoutes);
router.use('/activity-logs', auditRoutes);
router.use('/revalidate-all', revalidateRoutes);
router.use('/', publicRoutes);

export { router as apiRoutes };

import { Router } from 'express';
import { z } from 'zod';
import { paginationQuerySchema, universityListQuerySchema, uuidOrSlugSchema } from '@zero-compile/shared';
import { publicController } from '../controllers/public.controller';
import { validateParams, validateQuery } from '../middlewares/validate.middleware';

const router = Router();

router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
  }
  next();
});

const idParam = z.object({ id: uuidOrSlugSchema });
const slugParam = z.object({ slug: uuidOrSlugSchema });
const blogQuery = paginationQuerySchema.extend({ category: z.string().trim().max(100).optional() });
const eventQuery = z.object({ filter: z.enum(['all', 'upcoming', 'past']).default('all') });

// Public Directories
router.get('/countries', validateQuery(paginationQuerySchema), publicController.listCountries);
router.get('/countries/:id', validateParams(idParam), publicController.getCountry);

router.get('/universities', validateQuery(universityListQuerySchema), publicController.listUniversities);
router.get('/universities/:id', validateParams(idParam), publicController.getUniversity);

router.get('/blogs', validateQuery(blogQuery), publicController.listBlogs);
router.get('/blogs/:slug', validateParams(slugParam), publicController.getBlog);

router.get('/events', validateQuery(eventQuery), publicController.listEvents);
router.get('/events/:slug', validateParams(slugParam), publicController.getEvent);

router.get('/whatsapp', publicController.getWhatsApp);
router.get('/content/public', publicController.getPublicBundle);
router.get('/content/about-page', publicController.getAboutPage);
router.get('/content/contact-page', publicController.getContactPage);

export { router as publicRoutes };

import { Router } from 'express';
import { z } from 'zod';
import {
  aboutPageSchema,
  blogSchema,
  contactPageSchema,
  createCountrySchema,
  createUniversitySchema,
  eventSchema,
  footerSettingSchema,
  galleryItemSchema,
  gallerySettingSchema,
  heroContentSchema,
  heroStatsSchema,
  paginationQuerySchema,
  reorderCountriesSchema,
  reorderDisplayItemsSchema,
  sisterConcernSchema,
  siteContentAboutSchema,
  successStoriesPageSettingSchema,
  successStorySchema,
  universityListQuerySchema,
  updateBlogSchema,
  updateCountrySchema,
  updateEventSchema,
  updateGalleryItemSchema,
  updateSisterConcernSchema,
  updateSuccessStorySchema,
  updateUniversitySchema,
  uuidSchema,
  whatsappSettingSchema,
} from '@zero-compile/shared';
import { cmsController } from '../controllers/cms.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import { responseCache } from '../utils/cache';

function invalidateCacheOnWrite(...prefixes: string[]) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (req.method !== 'GET') {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          for (const prefix of prefixes) {
            responseCache.invalidatePrefix(prefix);
          }
        }
      });
    }
    next();
  };
}

const idParam = z.object({ id: uuidSchema });
const auditQuery = paginationQuerySchema.extend({
  entityType: z.enum(['inquiry', 'country', 'university', 'user']).optional(),
  action: z.string().trim().max(100).optional(),
});

// 1. Countries Admin Routes (/api/countries)
const countryAdminRouter = Router();
countryAdminRouter.use(invalidateCacheOnWrite('public:countries:', 'public:universities:'));
countryAdminRouter.get('/admin/list', requireAuth, requirePermission('countries:manage'), validateQuery(paginationQuerySchema), cmsController.listAllCountries);
countryAdminRouter.put('/reorder', requireAuth, requirePermission('countries:manage'), validateBody(reorderCountriesSchema), cmsController.reorderCountries);
countryAdminRouter.post('/', requireAuth, requirePermission('countries:manage'), validateBody(createCountrySchema), cmsController.createCountry);
countryAdminRouter.put('/:id', requireAuth, requirePermission('countries:manage'), validateParams(idParam), validateBody(updateCountrySchema), cmsController.updateCountry);
countryAdminRouter.delete('/:id', requireAuth, requirePermission('countries:manage'), validateParams(idParam), cmsController.deleteCountry);

// 2. Universities Admin Routes (/api/universities)
const universityAdminRouter = Router();
universityAdminRouter.use(invalidateCacheOnWrite('public:universities:', 'public:countries:'));
universityAdminRouter.get('/admin/list', requireAuth, requirePermission('universities:manage'), validateQuery(universityListQuerySchema), cmsController.listAllUniversities);
universityAdminRouter.post('/', requireAuth, requirePermission('universities:manage'), validateBody(createUniversitySchema), cmsController.createUniversity);
universityAdminRouter.put('/:id', requireAuth, requirePermission('universities:manage'), validateParams(idParam), validateBody(updateUniversitySchema), cmsController.updateUniversity);
universityAdminRouter.delete('/:id', requireAuth, requirePermission('universities:manage'), validateParams(idParam), cmsController.deleteUniversity);

// 3. CMS Content Admin Routes (/api/admin/content)
const cmsContentRouter = Router();
cmsContentRouter.use(requireAuth, requirePermission('content:manage'), invalidateCacheOnWrite('public:cms:', 'public:blogs:', 'public:events:'));

cmsContentRouter.get('/about', cmsController.getSiteAbout);
cmsContentRouter.put('/about', validateBody(siteContentAboutSchema), cmsController.upsertSiteAbout);

cmsContentRouter.get('/about-page', cmsController.getAboutPage);
cmsContentRouter.put('/about-page', validateBody(aboutPageSchema), cmsController.upsertAboutPage);

cmsContentRouter.get('/contact-page', cmsController.getContactPage);
cmsContentRouter.put('/contact-page', validateBody(contactPageSchema), cmsController.upsertContactPage);

cmsContentRouter.get('/hero-content', cmsController.getHeroContent);
cmsContentRouter.put('/hero-content', validateBody(heroContentSchema), cmsController.upsertHeroContent);

cmsContentRouter.get('/hero-stats', cmsController.getHeroStats);
cmsContentRouter.put('/hero-stats', validateBody(heroStatsSchema), cmsController.upsertHeroStats);

cmsContentRouter.get('/footer', cmsController.getFooter);
cmsContentRouter.put('/footer', validateBody(footerSettingSchema), cmsController.upsertFooter);

cmsContentRouter.get('/whatsapp', cmsController.getWhatsApp);
cmsContentRouter.put('/whatsapp', validateBody(whatsappSettingSchema), cmsController.upsertWhatsApp);

cmsContentRouter.get('/success-stories-page', cmsController.getSuccessStoriesPage);
cmsContentRouter.put('/success-stories-page', validateBody(successStoriesPageSettingSchema), cmsController.upsertSuccessStoriesPage);

cmsContentRouter.get('/success-stories', cmsController.listSuccessStories);
cmsContentRouter.post('/success-stories', validateBody(successStorySchema), cmsController.createSuccessStory);
cmsContentRouter.put('/success-stories/reorder', validateBody(reorderDisplayItemsSchema), cmsController.reorderSuccessStories);
cmsContentRouter.put('/success-stories/:id', validateParams(idParam), validateBody(updateSuccessStorySchema), cmsController.updateSuccessStory);
cmsContentRouter.delete('/success-stories/:id', validateParams(idParam), cmsController.deleteSuccessStory);

cmsContentRouter.get('/gallery/settings', cmsController.getGallerySettings);
cmsContentRouter.put('/gallery/settings', validateBody(gallerySettingSchema), cmsController.upsertGallerySettings);
cmsContentRouter.get('/gallery', cmsController.listGallery);
cmsContentRouter.post('/gallery', validateBody(galleryItemSchema), cmsController.createGalleryItem);
cmsContentRouter.put('/gallery/:id', validateParams(idParam), validateBody(updateGalleryItemSchema), cmsController.updateGalleryItem);
cmsContentRouter.delete('/gallery/:id', validateParams(idParam), cmsController.deleteGalleryItem);

cmsContentRouter.get('/sister-concerns', cmsController.listSisterConcerns);
cmsContentRouter.post('/sister-concerns', validateBody(sisterConcernSchema), cmsController.createSisterConcern);
cmsContentRouter.put('/sister-concerns/:id', validateParams(idParam), validateBody(updateSisterConcernSchema), cmsController.updateSisterConcern);
cmsContentRouter.delete('/sister-concerns/:id', validateParams(idParam), cmsController.deleteSisterConcern);

cmsContentRouter.get('/blogs', cmsController.listBlogs);
cmsContentRouter.post('/blogs', validateBody(blogSchema), cmsController.createBlog);
cmsContentRouter.put('/blogs/:id', validateParams(idParam), validateBody(updateBlogSchema), cmsController.updateBlog);
cmsContentRouter.delete('/blogs/:id', validateParams(idParam), cmsController.deleteBlog);

cmsContentRouter.get('/events', cmsController.listEvents);
cmsContentRouter.post('/events', validateBody(eventSchema), cmsController.createEvent);
cmsContentRouter.put('/events/:id', validateParams(idParam), validateBody(updateEventSchema), cmsController.updateEvent);
cmsContentRouter.delete('/events/:id', validateParams(idParam), cmsController.deleteEvent);

// 4. Audit Logs & Revalidate
const auditRouter = Router();
auditRouter.get('/', requireAuth, requirePermission('activity-log:view'), validateQuery(auditQuery), cmsController.listActivityLogs);

const revalidateRouter = Router();
revalidateRouter.post('/', requireAuth, requirePermission('cache:purge'), cmsController.revalidateAll);

export {
  auditRouter as auditRoutes,
  cmsContentRouter as cmsRoutes,
  countryAdminRouter,
  revalidateRouter as revalidateRoutes,
  universityAdminRouter,
};

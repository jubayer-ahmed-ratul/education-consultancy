import type { NextFunction, Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import type {
  CreateCountryInput,
  CreateUniversityInput,
  ReorderCountriesInput,
  UpdateCountryInput,
  UpdateUniversityInput,
} from '@zero-compile/shared';
import { cmsService } from '../services/cms.service';
import { responseCache } from '../utils/cache';
import { extractClientIp } from '../utils/ip';
import { sendSuccess } from '../utils/response';

export const cmsController = {
  // --- Countries ---
  async listAllCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; search?: string };
      const { items, meta } = await cmsService.listAllCountries(query);
      sendSuccess(res, items, 200, meta);
    } catch (err) {
      next(err);
    }
  },
  async createCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await cmsService.createCountry(req.body as CreateCountryInput, req.user!.id, extractClientIp(req));
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  },
  async updateCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const updated = await cmsService.updateCountry(id, req.body as UpdateCountryInput, req.user!.id, extractClientIp(req));
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },
  async deleteCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const result = await cmsService.deleteCountry(id, req.user!.id, extractClientIp(req));
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
  async reorderCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await cmsService.reorderCountries(req.body as ReorderCountriesInput, req.user!.id, extractClientIp(req));
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // --- Universities ---
  async listAllUniversities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; country?: string; search?: string };
      const { items, meta } = await cmsService.listAllUniversities(query);
      sendSuccess(res, items, 200, meta);
    } catch (err) {
      next(err);
    }
  },
  async createUniversity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await cmsService.createUniversity(req.body as CreateUniversityInput, req.user!.id, extractClientIp(req));
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  },
  async updateUniversity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const updated = await cmsService.updateUniversity(id, req.body as UpdateUniversityInput, req.user!.id, extractClientIp(req));
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },
  async deleteUniversity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const result = await cmsService.deleteUniversity(id, req.user!.id, extractClientIp(req));
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // --- Activity Logs & Cache Purge ---
  async listActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; entityType?: string; action?: string };
      const { logs, meta } = await cmsService.listActivityLogs(query);
      sendSuccess(res, logs, 200, meta);
    } catch (err) {
      next(err);
    }
  },
  async revalidateAll(_req: Request, res: Response): Promise<void> {
    responseCache.clearAll();
    sendSuccess(res, { revalidated: true, timestamp: new Date().toISOString() });
  },

  // --- CMS Singletons ---
  async getSiteAbout(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getSiteAbout()); } catch (e) { next(e); }
  },
  async upsertSiteAbout(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertSiteAbout(req.body as Prisma.SiteContentCreateInput)); } catch (e) { next(e); }
  },
  async getAboutPage(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getAboutPage()); } catch (e) { next(e); }
  },
  async upsertAboutPage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertAboutPage(req.body as Prisma.AboutPageCreateInput)); } catch (e) { next(e); }
  },
  async getContactPage(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getContactPage()); } catch (e) { next(e); }
  },
  async upsertContactPage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertContactPage(req.body as Prisma.ContactPageCreateInput)); } catch (e) { next(e); }
  },
  async getHeroContent(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getHeroContent()); } catch (e) { next(e); }
  },
  async upsertHeroContent(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertHeroContent(req.body as Prisma.HeroContentCreateInput)); } catch (e) { next(e); }
  },
  async getHeroStats(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getHeroStats()); } catch (e) { next(e); }
  },
  async upsertHeroStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { stats } = req.body as { stats: Array<{ order: number; label: string; value: string; suffix?: string | null }> };
      sendSuccess(res, await cmsService.upsertHeroStats(stats));
    } catch (e) { next(e); }
  },
  async getFooter(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getFooter()); } catch (e) { next(e); }
  },
  async upsertFooter(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertFooter(req.body as Prisma.FooterSettingCreateInput)); } catch (e) { next(e); }
  },
  async getWhatsApp(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getWhatsApp()); } catch (e) { next(e); }
  },
  async upsertWhatsApp(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertWhatsApp(req.body as Prisma.WhatsAppSettingCreateInput)); } catch (e) { next(e); }
  },
  async getSuccessStoriesPage(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getSuccessStoriesPage()); } catch (e) { next(e); }
  },
  async upsertSuccessStoriesPage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertSuccessStoriesPage(req.body as Prisma.SuccessStoriesPageSettingCreateInput)); } catch (e) { next(e); }
  },
  async getGallerySettings(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.getGallerySettings()); } catch (e) { next(e); }
  },
  async upsertGallerySettings(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.upsertGallerySettings(req.body as Prisma.GallerySettingCreateInput)); } catch (e) { next(e); }
  },

  // --- CMS Collections ---
  async listBlogs(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.listBlogs()); } catch (e) { next(e); }
  },
  async createBlog(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.createBlog(req.body as Record<string, unknown>, req.user!.id), 201); } catch (e) { next(e); }
  },
  async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.updateBlog(id, req.body as Record<string, unknown>, req.user!.id));
    } catch (e) { next(e); }
  },
  async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.deleteBlog(id));
    } catch (e) { next(e); }
  },

  async listEvents(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.listEvents()); } catch (e) { next(e); }
  },
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.createEvent(req.body as Record<string, unknown>, req.user!.id), 201); } catch (e) { next(e); }
  },
  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.updateEvent(id, req.body as Record<string, unknown>, req.user!.id));
    } catch (e) { next(e); }
  },
  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.deleteEvent(id));
    } catch (e) { next(e); }
  },

  async listSuccessStories(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.listSuccessStories()); } catch (e) { next(e); }
  },
  async createSuccessStory(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.createSuccessStory(req.body as Record<string, unknown>, req.user!.id), 201); } catch (e) { next(e); }
  },
  async updateSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.updateSuccessStory(id, req.body as Record<string, unknown>, req.user!.id));
    } catch (e) { next(e); }
  },
  async reorderSuccessStories(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body as { items: Array<{ id: string; displayOrder: number }> };
      sendSuccess(res, await cmsService.reorderSuccessStories(items));
    } catch (e) { next(e); }
  },
  async deleteSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.deleteSuccessStory(id));
    } catch (e) { next(e); }
  },

  async listGallery(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.listGallery()); } catch (e) { next(e); }
  },
  async createGalleryItem(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.createGalleryItem(req.body as Record<string, unknown>, req.user!.id), 201); } catch (e) { next(e); }
  },
  async updateGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.updateGalleryItem(id, req.body as Record<string, unknown>, req.user!.id));
    } catch (e) { next(e); }
  },
  async deleteGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.deleteGalleryItem(id));
    } catch (e) { next(e); }
  },

  async listSisterConcerns(_req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.listSisterConcerns()); } catch (e) { next(e); }
  },
  async createSisterConcern(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await cmsService.createSisterConcern(req.body as Record<string, unknown>, req.user!.id), 201); } catch (e) { next(e); }
  },
  async updateSisterConcern(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.updateSisterConcern(id, req.body as Record<string, unknown>, req.user!.id));
    } catch (e) { next(e); }
  },
  async deleteSisterConcern(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: string };
      sendSuccess(res, await cmsService.deleteSisterConcern(id));
    } catch (e) { next(e); }
  },
};

import type { NextFunction, Request, Response } from 'express';
import { publicService } from '../services/public.service';
import { sendSuccess } from '../utils/response';

export const publicController = {
  async listCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; search?: string };
      const { countries, meta } = await publicService.listCountries(query);
      sendSuccess(res, countries, 200, meta);
    } catch (err) {
      next(err);
    }
  },

  async getCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const country = await publicService.getCountry(id);
      sendSuccess(res, country);
    } catch (err) {
      next(err);
    }
  },

  async listUniversities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; country?: string; search?: string };
      const { universities, meta } = await publicService.listUniversities(query);
      sendSuccess(res, universities, 200, meta);
    } catch (err) {
      next(err);
    }
  },

  async getUniversity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const university = await publicService.getUniversity(id);
      sendSuccess(res, university);
    } catch (err) {
      next(err);
    }
  },

  async listBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as { page: number; limit: number; category?: string; search?: string };
      const { blogs, meta } = await publicService.listBlogs(query);
      sendSuccess(res, blogs, 200, meta);
    } catch (err) {
      next(err);
    }
  },

  async getBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.validatedParams as { slug: string };
      const blog = await publicService.getBlogBySlug(slug);
      sendSuccess(res, blog);
    } catch (err) {
      next(err);
    }
  },

  async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filter } = req.validatedQuery as { filter: 'all' | 'upcoming' | 'past' };
      const events = await publicService.listEvents(filter);
      sendSuccess(res, events);
    } catch (err) {
      next(err);
    }
  },

  async getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.validatedParams as { slug: string };
      const event = await publicService.getEventBySlug(slug);
      sendSuccess(res, event);
    } catch (err) {
      next(err);
    }
  },

  async getWhatsApp(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await publicService.getWhatsApp();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getPublicBundle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await publicService.getPublicBundle();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getAboutPage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await publicService.getAboutPage();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getContactPage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await publicService.getContactPage();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};

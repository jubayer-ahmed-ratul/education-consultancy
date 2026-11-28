import { Prisma } from '@prisma/client';
import type { PaginationMeta } from '@zero-compile/shared';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { responseCache } from '../utils/cache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIST_TTL_MS = 120_000; // 2 minutes
const SINGLETON_TTL_MS = 300_000; // 5 minutes

export const publicService = {
  async listCountries(query: { page: number; limit: number; search?: string }): Promise<{
    countries: unknown[];
    meta: PaginationMeta;
  }> {
    const cacheKey = `public:countries:list:${query.page}:${query.limit}:${query.search ?? ''}`;
    return responseCache.getOrSet(cacheKey, LIST_TTL_MS, async () => {
      const where: Prisma.CountryWhereInput = { isPublished: true };
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const skip = (query.page - 1) * query.limit;
      const [countries, total] = await Promise.all([
        prisma.country.findMany({
          where,
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          skip,
          take: query.limit,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            intakes: true,
            order: true,
          },
        }),
        prisma.country.count({ where }),
      ]);

      return {
        countries,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      };
    });
  },

  async getCountry(idOrSlug: string) {
    return responseCache.getOrSet(`public:countries:detail:${idOrSlug}`, LIST_TTL_MS, async () => {
      const where: Prisma.CountryWhereInput = UUID_REGEX.test(idOrSlug)
        ? { id: idOrSlug, isPublished: true }
        : { slug: idOrSlug, isPublished: true };

      const country = await prisma.country.findFirst({
        where,
        include: {
          universities: {
            where: { isPublished: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, city: true, logoUrl: true, imageUrl: true },
          },
        },
      });

      if (!country) {
        throw new AppError(404, 'NOT_FOUND', 'Destination country not found.');
      }
      return country;
    });
  },

  async listUniversities(query: {
    page: number;
    limit: number;
    country?: string;
    search?: string;
  }): Promise<{ universities: unknown[]; meta: PaginationMeta }> {
    const cacheKey = `public:universities:list:${query.page}:${query.limit}:${query.country ?? ''}:${query.search ?? ''}`;
    return responseCache.getOrSet(cacheKey, LIST_TTL_MS, async () => {
      const where: Prisma.UniversityWhereInput = {
        isPublished: true,
        country: { isPublished: true },
      };

      if (query.country) {
        if (UUID_REGEX.test(query.country)) {
          where.countryId = query.country;
        } else {
          where.country = { isPublished: true, slug: query.country };
        }
      }

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const skip = (query.page - 1) * query.limit;
      const [universities, total] = await Promise.all([
        prisma.university.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: query.limit,
          select: {
            id: true,
            name: true,
            slug: true,
            countryId: true,
            city: true,
            logoUrl: true,
            imageUrl: true,
            description: true,
            programs: true,
            tuitionRange: true,
            englishRequirements: true,
            scholarshipDetails: true,
            applicationDeadlines: true,
            admissionRequirements: true,
            website: true,
            country: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.university.count({ where }),
      ]);

      return {
        universities,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      };
    });
  },

  async getUniversity(idOrSlug: string) {
    return responseCache.getOrSet(`public:universities:detail:${idOrSlug}`, LIST_TTL_MS, async () => {
      const where: Prisma.UniversityWhereInput = UUID_REGEX.test(idOrSlug)
        ? { id: idOrSlug, isPublished: true }
        : { slug: idOrSlug, isPublished: true };

      const university = await prisma.university.findFirst({
        where,
        include: {
          country: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!university) {
        throw new AppError(404, 'NOT_FOUND', 'University not found.');
      }
      return university;
    });
  },

  async listBlogs(query: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }): Promise<{ blogs: unknown[]; meta: PaginationMeta }> {
    const cacheKey = `public:blogs:list:${query.page}:${query.limit}:${query.category ?? ''}:${query.search ?? ''}`;
    return responseCache.getOrSet(cacheKey, LIST_TTL_MS, async () => {
      const where: Prisma.BlogWhereInput = { isPublished: true };
      if (query.category) where.category = query.category;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { excerpt: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const skip = (query.page - 1) * query.limit;
      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where,
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: query.limit,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            category: true,
            author: true,
            publishedAt: true,
            featuredImage: true,
          },
        }),
        prisma.blog.count({ where }),
      ]);

      return {
        blogs,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      };
    });
  },

  async getBlogBySlug(slug: string) {
    return responseCache.getOrSet(`public:blogs:detail:${slug}`, LIST_TTL_MS, async () => {
      const blog = await prisma.blog.findFirst({
        where: { slug, isPublished: true },
      });
      if (!blog) {
        throw new AppError(404, 'NOT_FOUND', 'Blog post not found.');
      }
      return blog;
    });
  },

  async listEvents(filter: 'all' | 'upcoming' | 'past' = 'all') {
    return responseCache.getOrSet(`public:events:list:${filter}`, LIST_TTL_MS, async () => {
      const now = new Date();
      const where: Prisma.EventWhereInput = { isPublished: true };
      if (filter === 'upcoming') {
        where.eventDate = { gte: now };
      } else if (filter === 'past') {
        where.eventDate = { lt: now };
      }

      return prisma.event.findMany({
        where,
        orderBy: { eventDate: filter === 'upcoming' ? 'asc' : 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          eventDate: true,
          startTime: true,
          endTime: true,
          locationType: true,
          venue: true,
        },
      });
    });
  },

  async getEventBySlug(slug: string) {
    return responseCache.getOrSet(`public:events:detail:${slug}`, LIST_TTL_MS, async () => {
      const event = await prisma.event.findFirst({
        where: { slug, isPublished: true },
      });
      if (!event) {
        throw new AppError(404, 'NOT_FOUND', 'Event not found.');
      }
      return event;
    });
  },

  async getWhatsApp() {
    return responseCache.getOrSet('public:cms:whatsapp', SINGLETON_TTL_MS, () =>
      prisma.whatsAppSetting.findUnique({ where: { key: 'whatsapp-contact' } })
    );
  },

  async getPublicBundle() {
    return responseCache.getOrSet('public:cms:bundle', SINGLETON_TTL_MS, async () => {
      const [
        heroContent,
        heroStats,
        siteContent,
        footerSetting,
        whatsappSetting,
        gallerySetting,
        successStoriesPageSetting,
        successStories,
        galleryItems,
        sisterConcerns,
      ] = await Promise.all([
        prisma.heroContent.findUnique({ where: { singletonKey: 'hero-content' } }),
        prisma.heroStat.findMany({ orderBy: { order: 'asc' } }),
        prisma.siteContent.findUnique({ where: { key: 'homepage-about' } }),
        prisma.footerSetting.findUnique({ where: { key: 'footer-setting' } }),
        prisma.whatsAppSetting.findUnique({ where: { key: 'whatsapp-contact' } }),
        prisma.gallerySetting.findUnique({ where: { key: 'homepage-gallery' } }),
        prisma.successStoriesPageSetting.findUnique({ where: { key: 'success-stories-page' } }),
        prisma.successStory.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.galleryItem.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.sisterConcern.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      ]);

      return {
        heroContent,
        heroStats,
        siteContent,
        footerSetting,
        whatsappSetting,
        gallerySetting,
        successStoriesPageSetting,
        successStories,
        galleryItems,
        sisterConcerns,
      };
    });
  },

  async getAboutPage() {
    return responseCache.getOrSet('public:cms:about-page', SINGLETON_TTL_MS, () =>
      prisma.aboutPage.findUnique({ where: { key: 'about-page' } })
    );
  },

  async getContactPage() {
    return responseCache.getOrSet('public:cms:contact-page', SINGLETON_TTL_MS, () =>
      prisma.contactPage.findUnique({ where: { key: 'contact-page' } })
    );
  },
};

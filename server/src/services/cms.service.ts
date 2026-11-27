import { Prisma } from '@prisma/client';
import type {
  CreateCountryInput,
  CreateUniversityInput,
  PaginationMeta,
  ReorderCountriesInput,
  UpdateCountryInput,
  UpdateUniversityInput,
} from '@zero-compile/shared';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { responseCache } from '../utils/cache';
import { toSlug } from '../utils/slug';
import { activityLogService } from './activity-log.service';

export const cmsService = {
  // --- Countries ---
  async listAllCountries(query: { page: number; limit: number; search?: string }) {
    const cacheKey = `admin:countries:list:${query.page}:${query.limit}:${query.search ?? ''}`;
    return responseCache.getOrSet(cacheKey, 30_000, async () => {
      const where: Prisma.CountryWhereInput = {};
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      const skip = (query.page - 1) * query.limit;
      const [items, total] = await Promise.all([
        prisma.country.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], skip, take: query.limit }),
        prisma.country.count({ where }),
      ]);
      return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
    });
  },

  async createCountry(input: CreateCountryInput, actorId: string, ipAddress?: string | null) {
    const slug = input.slug || toSlug(input.name);
    const created = await prisma.country.create({
      data: { ...input, slug, createdById: actorId },
    });
    await activityLogService.log({
      action: 'country.created',
      entityType: 'country',
      entityId: created.id,
      performedById: actorId,
      details: { name: created.name, slug: created.slug, isPublished: created.isPublished },
      ipAddress,
    });
    return created;
  },

  async updateCountry(id: string, input: UpdateCountryInput, actorId: string, ipAddress?: string | null) {
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Country not found.');
    const updated = await prisma.country.update({
      where: { id },
      data: input,
    });
    await activityLogService.log({
      action: 'country.updated',
      entityType: 'country',
      entityId: id,
      performedById: actorId,
      details: { updatedFields: Object.keys(input) },
      ipAddress,
    });
    return updated;
  },

  async deleteCountry(id: string, actorId: string, ipAddress?: string | null) {
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Country not found.');
    const uniCount = await prisma.university.count({ where: { countryId: id } });
    if (uniCount > 0) {
      throw new AppError(409, 'COUNTRY_HAS_UNIVERSITIES', 'Cannot delete a country that still has linked universities.');
    }
    await prisma.country.delete({ where: { id } });
    await activityLogService.log({
      action: 'country.deleted',
      entityType: 'country',
      entityId: id,
      performedById: actorId,
      details: { name: existing.name },
      ipAddress,
    });
    return { id };
  },

  async reorderCountries(input: ReorderCountriesInput, actorId: string, ipAddress?: string | null) {
    await prisma.$transaction(
      input.items.map((item) =>
        prisma.country.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    await activityLogService.log({
      action: 'country.reordered',
      entityType: 'country',
      entityId: input.items[0]!.id,
      performedById: actorId,
      details: { count: input.items.length },
      ipAddress,
    });
    return { updated: input.items.length };
  },

  // --- Universities ---
  async listAllUniversities(query: { page: number; limit: number; country?: string; search?: string }) {
    const cacheKey = `admin:universities:list:${query.page}:${query.limit}:${query.country ?? ''}:${query.search ?? ''}`;
    return responseCache.getOrSet(cacheKey, 30_000, async () => {
      const where: Prisma.UniversityWhereInput = {};
      if (query.country) where.countryId = query.country;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      const skip = (query.page - 1) * query.limit;
      const [items, total] = await Promise.all([
        prisma.university.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: query.limit,
          include: { country: { select: { id: true, name: true, slug: true } } },
        }),
        prisma.university.count({ where }),
      ]);
      return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
    });
  },

  async createUniversity(input: CreateUniversityInput, actorId: string, ipAddress?: string | null) {
    const country = await prisma.country.findUnique({ where: { id: input.countryId } });
    if (!country) throw new AppError(400, 'INVALID_COUNTRY', 'Selected country does not exist.');
    const slug = input.slug || toSlug(input.name);
    const created = await prisma.university.create({
      data: {
        ...input,
        slug,
        tuitionRange: input.tuitionRange ? (input.tuitionRange as Prisma.InputJsonValue) : Prisma.JsonNull,
        createdById: actorId,
      },
    });
    await activityLogService.log({
      action: 'university.created',
      entityType: 'university',
      entityId: created.id,
      performedById: actorId,
      details: { name: created.name, countryId: created.countryId },
      ipAddress,
    });
    return created;
  },

  async updateUniversity(id: string, input: UpdateUniversityInput, actorId: string, ipAddress?: string | null) {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'University not found.');
    const data: Prisma.UniversityUpdateInput = {
      ...(input as Omit<UpdateUniversityInput, 'tuitionRange' | 'countryId'>),
      ...(input.countryId ? { country: { connect: { id: input.countryId } } } : {}),
      ...(input.tuitionRange !== undefined
        ? { tuitionRange: input.tuitionRange ? (input.tuitionRange as Prisma.InputJsonValue) : Prisma.JsonNull }
        : {}),
    };
    const updated = await prisma.university.update({ where: { id }, data });
    await activityLogService.log({
      action: 'university.updated',
      entityType: 'university',
      entityId: id,
      performedById: actorId,
      details: { updatedFields: Object.keys(input) },
      ipAddress,
    });
    return updated;
  },

  async deleteUniversity(id: string, actorId: string, ipAddress?: string | null) {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'University not found.');
    await prisma.university.delete({ where: { id } });
    await activityLogService.log({
      action: 'university.deleted',
      entityType: 'university',
      entityId: id,
      performedById: actorId,
      details: { name: existing.name },
      ipAddress,
    });
    return { id };
  },

  // --- Activity Logs ---
  async listActivityLogs(query: { page: number; limit: number; entityType?: string; action?: string }): Promise<{
    logs: unknown[];
    meta: PaginationMeta;
  }> {
    const where: Prisma.ActivityLogWhereInput = {};
    if (query.entityType) where.entityType = query.entityType as Prisma.EnumAuditEntityTypeFilter<'ActivityLog'>;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: { performedBy: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { logs, meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
  },

  // --- CMS Singletons ---
  getSiteAbout: () => prisma.siteContent.findUnique({ where: { key: 'homepage-about' } }),
  upsertSiteAbout: (data: Prisma.SiteContentCreateInput) =>
    prisma.siteContent.upsert({ where: { key: 'homepage-about' }, update: data, create: { ...data, key: 'homepage-about' } }),

  getAboutPage: () => prisma.aboutPage.findUnique({ where: { key: 'about-page' } }),
  upsertAboutPage: (data: Prisma.AboutPageCreateInput) =>
    prisma.aboutPage.upsert({ where: { key: 'about-page' }, update: data, create: { ...data, key: 'about-page' } }),

  getContactPage: () => prisma.contactPage.findUnique({ where: { key: 'contact-page' } }),
  upsertContactPage: (data: Prisma.ContactPageCreateInput) =>
    prisma.contactPage.upsert({ where: { key: 'contact-page' }, update: data, create: { ...data, key: 'contact-page' } }),

  getHeroContent: () => prisma.heroContent.findUnique({ where: { singletonKey: 'hero-content' } }),
  upsertHeroContent: (data: Prisma.HeroContentCreateInput) =>
    prisma.heroContent.upsert({
      where: { singletonKey: 'hero-content' },
      update: data,
      create: { ...data, singletonKey: 'hero-content' },
    }),

  getHeroStats: () => prisma.heroStat.findMany({ orderBy: { order: 'asc' } }),
  upsertHeroStats: (stats: Array<{ order: number; label: string; value: string; suffix?: string | null }>) =>
    prisma.$transaction(
      stats.map((s) =>
        prisma.heroStat.upsert({
          where: { order: s.order },
          update: { label: s.label, value: s.value, suffix: s.suffix ?? null },
          create: { order: s.order, label: s.label, value: s.value, suffix: s.suffix ?? null },
        })
      )
    ),

  getFooter: () => prisma.footerSetting.findUnique({ where: { key: 'footer-setting' } }),
  upsertFooter: (data: Prisma.FooterSettingCreateInput) =>
    prisma.footerSetting.upsert({ where: { key: 'footer-setting' }, update: data, create: { ...data, key: 'footer-setting' } }),

  getWhatsApp: () => prisma.whatsAppSetting.findUnique({ where: { key: 'whatsapp-contact' } }),
  upsertWhatsApp: (data: Prisma.WhatsAppSettingCreateInput) =>
    prisma.whatsAppSetting.upsert({ where: { key: 'whatsapp-contact' }, update: data, create: { ...data, key: 'whatsapp-contact' } }),

  getSuccessStoriesPage: () => prisma.successStoriesPageSetting.findUnique({ where: { key: 'success-stories-page' } }),
  upsertSuccessStoriesPage: (data: Prisma.SuccessStoriesPageSettingCreateInput) =>
    prisma.successStoriesPageSetting.upsert({
      where: { key: 'success-stories-page' },
      update: data,
      create: { ...data, key: 'success-stories-page' },
    }),

  getGallerySettings: () => prisma.gallerySetting.findUnique({ where: { key: 'homepage-gallery' } }),
  upsertGallerySettings: (data: Prisma.GallerySettingCreateInput) =>
    prisma.gallerySetting.upsert({ where: { key: 'homepage-gallery' }, update: data, create: { ...data, key: 'homepage-gallery' } }),

  // --- CMS Collections ---
  listBlogs: () =>
    responseCache.getOrSet('admin:cms:blogs', 30_000, () =>
      prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
    ),
  createBlog: (data: Record<string, unknown>, actorId: string) => {
    const title = String(data.title);
    const slug = (data.slug as string | undefined) || toSlug(title);
    return prisma.blog.create({
      data: {
        ...(data as Prisma.BlogCreateInput),
        slug,
        publishedAt: data.isPublished && !data.publishedAt ? new Date() : (data.publishedAt as Date | null | undefined),
        createdById: actorId,
        updatedById: actorId,
      },
    });
  },
  updateBlog: (id: string, data: Record<string, unknown>, actorId: string) =>
    prisma.blog.update({ where: { id }, data: { ...(data as Prisma.BlogUpdateInput), updatedById: actorId } }),
  deleteBlog: (id: string) => prisma.blog.delete({ where: { id } }),

  listEvents: () =>
    responseCache.getOrSet('admin:cms:events', 30_000, () =>
      prisma.event.findMany({ orderBy: { eventDate: 'desc' } })
    ),
  createEvent: (data: Record<string, unknown>, actorId: string) => {
    const title = String(data.title);
    const slug = (data.slug as string | undefined) || toSlug(title);
    const locationType = data.locationType === 'in-person' ? 'in_person' : data.locationType;
    return prisma.event.create({
      data: {
        ...(data as Prisma.EventCreateInput),
        slug,
        ...(locationType ? { locationType: locationType as 'in_person' | 'online' | 'hybrid' } : {}),
        createdById: actorId,
        updatedById: actorId,
      },
    });
  },
  updateEvent: (id: string, data: Record<string, unknown>, actorId: string) => {
    const locationType = data.locationType === 'in-person' ? 'in_person' : data.locationType;
    return prisma.event.update({
      where: { id },
      data: {
        ...(data as Prisma.EventUpdateInput),
        ...(locationType ? { locationType: locationType as 'in_person' | 'online' | 'hybrid' } : {}),
        updatedById: actorId,
      },
    });
  },
  deleteEvent: (id: string) => prisma.event.delete({ where: { id } }),

  listSuccessStories: () => prisma.successStory.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
  createSuccessStory: (data: Record<string, unknown>, actorId: string) => {
    const name = String(data.name);
    const slug = (data.slug as string | undefined) || toSlug(`${name}-${Date.now()}`);
    return prisma.successStory.create({
      data: { ...(data as Prisma.SuccessStoryCreateInput), slug, createdById: actorId, updatedById: actorId },
    });
  },
  updateSuccessStory: (id: string, data: Record<string, unknown>, actorId: string) =>
    prisma.successStory.update({ where: { id }, data: { ...(data as Prisma.SuccessStoryUpdateInput), updatedById: actorId } }),
  reorderSuccessStories: (items: Array<{ id: string; displayOrder: number }>) =>
    prisma.$transaction(
      items.map((item) => prisma.successStory.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } }))
    ),
  deleteSuccessStory: (id: string) => prisma.successStory.delete({ where: { id } }),

  listGallery: () => prisma.galleryItem.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
  createGalleryItem: (data: Record<string, unknown>, actorId: string) =>
    prisma.galleryItem.create({
      data: { ...(data as Prisma.GalleryItemCreateInput), createdById: actorId, updatedById: actorId },
    }),
  updateGalleryItem: (id: string, data: Record<string, unknown>, actorId: string) =>
    prisma.galleryItem.update({ where: { id }, data: { ...(data as Prisma.GalleryItemUpdateInput), updatedById: actorId } }),
  deleteGalleryItem: (id: string) => prisma.galleryItem.delete({ where: { id } }),

  listSisterConcerns: () => prisma.sisterConcern.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
  createSisterConcern: (data: Record<string, unknown>, actorId: string) =>
    prisma.sisterConcern.create({
      data: { ...(data as Prisma.SisterConcernCreateInput), createdById: actorId, updatedById: actorId },
    }),
  updateSisterConcern: (id: string, data: Record<string, unknown>, actorId: string) =>
    prisma.sisterConcern.update({ where: { id }, data: { ...(data as Prisma.SisterConcernUpdateInput), updatedById: actorId } }),
  deleteSisterConcern: (id: string) => prisma.sisterConcern.delete({ where: { id } }),
};

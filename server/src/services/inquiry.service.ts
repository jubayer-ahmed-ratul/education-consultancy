import { InquiryStatus, Prisma, UserRole } from '@prisma/client';
import {
  canTransitionStatus,
  INQUIRY_STATUS_META,
  type AddInquiryNoteInput,
  type InquiryListQuery,
  type InquiryStatusType,
  type PaginationMeta,
  type PublicSubmitInquiryInput,
  type UserRoleType,
} from '@zero-compile/shared';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { toDtoInquiryStatus, toPrismaInquiryStatus } from '../utils/inquiry-mapper';
import { activityLogService } from './activity-log.service';
import { counterService } from './counter.service';
import { emailService } from './email.service';

export const inquiryService = {
  async submitPublic(input: PublicSubmitInquiryInput, ipAddress?: string | null) {
    if (input.preferredCountry) {
      const country = await prisma.country.findFirst({
        where: { id: input.preferredCountry, isPublished: true },
        select: { id: true },
      });
      if (!country) {
        throw new AppError(400, 'INVALID_COUNTRY', 'Selected destination country is not available.');
      }
    }

    if (input.preferredUniversity) {
      const university = await prisma.university.findFirst({
        where: { id: input.preferredUniversity, isPublished: true },
        select: { id: true, countryId: true },
      });
      if (!university) {
        throw new AppError(400, 'INVALID_UNIVERSITY', 'Selected university is not available.');
      }
      if (input.preferredCountry && university.countryId !== input.preferredCountry) {
        throw new AppError(
          400,
          'UNIVERSITY_COUNTRY_MISMATCH',
          'Selected university does not belong to the chosen country.'
        );
      }
    }

    // Retry loop for reference number collision resilience
    let created = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        created = await prisma.$transaction(async (tx) => {
          const referenceNumber = await counterService.generateInquiryReference(tx);
          return tx.inquiry.create({
            data: {
              referenceNumber,
              studentFirstName: input.student.firstName,
              studentLastName: input.student.lastName,
              studentEmail: input.student.email.toLowerCase(),
              studentPhone: input.student.phone ?? null,
              studentNationality: input.student.nationality ?? null,
              currentEducationLevel: input.academic.currentEducationLevel,
              fieldOfStudy: input.academic.fieldOfStudy ?? null,
              gpa: input.academic.gpa ?? null,
              englishProficiency: input.academic.englishProficiency ?? null,
              preferredCountryId: input.preferredCountry ?? null,
              preferredUniversityId: input.preferredUniversity ?? null,
              intendedProgram: input.intendedProgram ?? null,
              intakeYear: input.intakeYear ?? null,
              intakeSemester: input.intakeSemester ?? null,
              category: input.category,
              message: input.message,
              status: InquiryStatus.new,
              priority: 'normal',
            },
            select: {
              id: true,
              referenceNumber: true,
              status: true,
              createdAt: true,
            },
          });
        });
        break;
      } catch (err) {
        const isUniqueViolation =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
        if (!isUniqueViolation || attempt === 2) {
          throw err;
        }
      }
    }

    if (!created) {
      throw new AppError(500, 'INQUIRY_CREATE_FAILED', 'Could not create inquiry.');
    }

    await activityLogService.log({
      action: 'inquiry.created',
      entityType: 'inquiry',
      entityId: created.id,
      performedById: null,
      details: {
        referenceNumber: created.referenceNumber,
        category: input.category,
        gpa: input.academic.gpa,
        phoneNumber: input.student.phone,
      },
      ipAddress,
    });

    emailService
      .sendInquiryConfirmation(
        input.student.email.toLowerCase(),
        created.referenceNumber,
        input.student.firstName
      )
      .catch((err) => console.error('[InquiryService] Confirmation email failed:', err));

    return {
      referenceNumber: created.referenceNumber,
      status: toDtoInquiryStatus(created.status),
      createdAt: created.createdAt,
      message:
        'Your inquiry has been submitted successfully. Please save your reference number for future communication.',
    };
  },

  async list(query: InquiryListQuery): Promise<{ inquiries: unknown[]; meta: PaginationMeta }> {
    const where: Prisma.InquiryWhereInput = {};

    if (query.status) {
      where.status = toPrismaInquiryStatus(query.status);
    } else {
      // CLONE_SPEC 3.3: Automatically excludes status: 'closed' unless explicitly requested
      where.status = { not: InquiryStatus.closed };
    }

    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.assignedTo) where.assignedToId = query.assignedTo;
    if (query.preferredCountry) where.preferredCountryId = query.preferredCountry;
    if (query.preferredUniversity) where.preferredUniversityId = query.preferredUniversity;

    if (query.search) {
      where.OR = [
        { referenceNumber: { contains: query.search, mode: 'insensitive' } },
        { studentFirstName: { contains: query.search, mode: 'insensitive' } },
        { studentLastName: { contains: query.search, mode: 'insensitive' } },
        { studentEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.InquiryOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (query.sort === 'priority_desc') orderBy = { priority: 'desc' };
    else if (query.sort === 'priority_asc') orderBy = { priority: 'asc' };

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          preferredCountry: { select: { id: true, name: true, slug: true } },
          preferredUniversity: { select: { id: true, name: true, slug: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return {
      inquiries: rows.map((row) => ({
        ...row,
        status: toDtoInquiryStatus(row.status),
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getById(id: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        preferredCountry: { select: { id: true, name: true, slug: true } },
        preferredUniversity: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!inquiry) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    const auditHistory = await prisma.activityLog.findMany({
      where: { entityType: 'inquiry', entityId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        performedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      ...inquiry,
      status: toDtoInquiryStatus(inquiry.status),
      auditHistory,
    };
  },

  async updateStatus(
    id: string,
    targetStatus: InquiryStatusType,
    actor: { id: string; role: UserRoleType },
    ipAddress?: string | null
  ) {
    const existing = await prisma.inquiry.findUnique({
      where: { id },
      select: { id: true, status: true, referenceNumber: true, studentEmail: true },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    const fromStatus = toDtoInquiryStatus(existing.status);
    const check = canTransitionStatus(fromStatus, targetStatus, actor.role);
    if (!check.allowed) {
      const code =
        actor.role !== 'super-admin' &&
        (fromStatus === 'closed' || fromStatus === 'rejected' || targetStatus === 'closed' || targetStatus === 'rejected')
          ? 403
          : 400;
      throw new AppError(code, 'INVALID_STATUS_TRANSITION', check.reason ?? 'Status transition not allowed.');
    }

    const prismaTargetStatus = toPrismaInquiryStatus(targetStatus);
    const updateResult = await prisma.inquiry.updateMany({
      where: { id, status: existing.status },
      data: { status: prismaTargetStatus },
    });

    if (updateResult.count === 0) {
      throw new AppError(
        409,
        'CONCURRENT_MODIFICATION',
        'Inquiry status was modified by another request. Please refresh and try again.'
      );
    }

    const isReopen = (fromStatus === 'closed' || fromStatus === 'rejected') && targetStatus === 'in-review';
    await activityLogService.log({
      action: isReopen ? 'inquiry.reopened' : 'inquiry.status_changed',
      entityType: 'inquiry',
      entityId: id,
      performedById: actor.id,
      details: {
        referenceNumber: existing.referenceNumber,
        fromStatus,
        toStatus: targetStatus,
      },
      ipAddress,
    });

    emailService
      .sendStatusUpdate(existing.studentEmail, existing.referenceNumber, INQUIRY_STATUS_META[targetStatus].label)
      .catch((err) => console.error('[InquiryService] Status email failed:', err));

    return { id, status: targetStatus, previousStatus: fromStatus };
  },

  async addNote(
    id: string,
    input: AddInquiryNoteInput,
    actorId: string,
    ipAddress?: string | null
  ) {
    const existing = await prisma.inquiry.findUnique({
      where: { id },
      select: { id: true, referenceNumber: true },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    const note = await prisma.inquiryNote.create({
      data: {
        inquiryId: id,
        content: input.content,
        createdById: actorId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await activityLogService.log({
      action: 'inquiry.note_added',
      entityType: 'inquiry',
      entityId: id,
      performedById: actorId,
      details: {
        referenceNumber: existing.referenceNumber,
        noteId: note.id,
      },
      ipAddress,
    });

    return note;
  },

  async assignCounselor(
    id: string,
    assignedToId: string,
    actorId: string,
    ipAddress?: string | null
  ) {
    const [inquiry, targetUser] = await Promise.all([
      prisma.inquiry.findUnique({
        where: { id },
        select: { id: true, status: true, assignedToId: true, referenceNumber: true },
      }),
      prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      }),
    ]);

    if (!inquiry) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    if (
      !targetUser ||
      !targetUser.isActive ||
      (targetUser.role !== UserRole.admin && targetUser.role !== UserRole.super_admin)
    ) {
      throw new AppError(400, 'INVALID_COUNSELOR', 'Target counselor must be an active Admin or Super Admin.');
    }

    const isReassignment = Boolean(inquiry.assignedToId);
    const nextStatus = inquiry.status === InquiryStatus.new ? InquiryStatus.assigned : inquiry.status;

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        assignedToId,
        assignedById: actorId,
        assignedAt: new Date(),
        status: nextStatus,
      },
      select: {
        id: true,
        status: true,
        assignedToId: true,
        assignedById: true,
        assignedAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await activityLogService.log({
      action: isReassignment ? 'inquiry.reassigned' : 'inquiry.assigned',
      entityType: 'inquiry',
      entityId: id,
      performedById: actorId,
      details: {
        referenceNumber: inquiry.referenceNumber,
        previousAssignedToId: inquiry.assignedToId,
        assignedToId,
        status: toDtoInquiryStatus(updated.status),
      },
      ipAddress,
    });

    return {
      ...updated,
      status: toDtoInquiryStatus(updated.status),
    };
  },

  async addDocument(
    id: string,
    doc: { fileName: string; fileType: string; storageKey: string },
    actorId: string,
    ipAddress?: string | null
  ) {
    const existing = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    const created = await prisma.inquiryDocument.create({
      data: {
        inquiryId: id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        storageKey: doc.storageKey,
      },
    });

    await activityLogService.log({
      action: 'inquiry.document_added',
      entityType: 'inquiry',
      entityId: id,
      performedById: actorId,
      details: { documentId: created.id, fileName: created.fileName },
      ipAddress,
    });

    return created;
  },

  async removeDocument(
    id: string,
    documentId: string,
    actorId: string,
    ipAddress?: string | null
  ) {
    const existing = await prisma.inquiryDocument.findFirst({
      where: { id: documentId, inquiryId: id },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Document not found on this inquiry.');
    }

    await prisma.inquiryDocument.delete({ where: { id: documentId } });

    await activityLogService.log({
      action: 'inquiry.document_removed',
      entityType: 'inquiry',
      entityId: id,
      performedById: actorId,
      details: { documentId, fileName: existing.fileName },
      ipAddress,
    });

    return { id: documentId };
  },
};

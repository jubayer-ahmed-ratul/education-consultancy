import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import {
  buildTrackingTimeline,
  INQUIRY_STATUS_META,
  type TrackInquiryInput,
} from '@zero-compile/shared';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { toDtoInquiryStatus } from '../utils/inquiry-mapper';
import { emailService } from './email.service';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function maskStudentName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0).toUpperCase();
  return initial ? `${firstName.trim()} ${initial}.` : firstName.trim();
}

export const trackingService = {
  async trackApplication(input: TrackInquiryInput) {
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        referenceNumber: input.trackingId.toUpperCase(),
        studentEmail: input.email.toLowerCase(),
      },
      include: {
        preferredCountry: { select: { name: true } },
        preferredUniversity: { select: { name: true } },
      },
    });

    if (!inquiry) {
      throw new AppError(
        404,
        'APPLICATION_NOT_FOUND',
        'No application found matching that Tracking ID and email address.'
      );
    }

    const status = toDtoInquiryStatus(inquiry.status);
    const meta = INQUIRY_STATUS_META[status];
    const intake =
      inquiry.intakeSemester && inquiry.intakeYear
        ? `${inquiry.intakeSemester} ${inquiry.intakeYear}`
        : inquiry.intakeYear
          ? String(inquiry.intakeYear)
          : null;

    return {
      trackingId: inquiry.referenceNumber,
      studentName: maskStudentName(inquiry.studentFirstName, inquiry.studentLastName),
      preferredCountry: inquiry.preferredCountry?.name ?? null,
      preferredUniversity: inquiry.preferredUniversity?.name ?? null,
      intendedProgram: inquiry.intendedProgram,
      intake,
      status,
      statusLabel: meta.label,
      statusDescription: meta.description,
      submittedAt: inquiry.createdAt.toISOString(),
      lastUpdatedAt: inquiry.updatedAt.toISOString(),
      timeline: buildTrackingTimeline(status, inquiry.createdAt, inquiry.updatedAt),
      advisoryNote: meta.advisoryNote,
    };
  },

  async requestRecovery(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    // Always generate & hash OTP first for constant-time behavior
    const otp = String(randomInt(100000, 1000000));
    const hashedCode = hashOtp(otp);

    const inquiryCount = await prisma.inquiry.count({
      where: { studentEmail: normalizedEmail },
    });

    if (inquiryCount > 0) {
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      await prisma.$transaction([
        prisma.recoveryToken.deleteMany({ where: { email: normalizedEmail } }),
        prisma.recoveryToken.create({
          data: {
            email: normalizedEmail,
            hashedCode,
            attempts: 0,
            expiresAt,
          },
        }),
      ]);

      await emailService.sendRecoveryOtp(normalizedEmail, otp);
    }

    return {
      message:
        'If an active application is associated with this email address, a 6-digit verification code has been dispatched.',
    };
  },

  async verifyRecovery(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    const token = await prisma.recoveryToken.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: now },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      throw new AppError(400, 'INVALID_OR_EXPIRED_OTP', 'Invalid or expired verification code.');
    }

    const inputHashBuf = Buffer.from(hashOtp(code.trim()), 'hex');
    const storedHashBuf = Buffer.from(token.hashedCode, 'hex');
    const matches =
      inputHashBuf.length === storedHashBuf.length && timingSafeEqual(inputHashBuf, storedHashBuf);

    if (!matches) {
      const nextAttempts = token.attempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await prisma.recoveryToken.delete({ where: { id: token.id } });
      } else {
        await prisma.recoveryToken.update({
          where: { id: token.id },
          data: { attempts: { increment: 1 } },
        });
      }
      throw new AppError(400, 'INVALID_OR_EXPIRED_OTP', 'Invalid or expired verification code.');
    }

    // Consume token immediately upon verification
    await prisma.recoveryToken.delete({ where: { id: token.id } });

    const inquiries = await prisma.inquiry.findMany({
      where: { studentEmail: normalizedEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        preferredCountry: { select: { name: true } },
        preferredUniversity: { select: { name: true } },
      },
    });

    return inquiries.map((inq) => {
      const status = toDtoInquiryStatus(inq.status);
      const intake =
        inq.intakeSemester && inq.intakeYear
          ? `${inq.intakeSemester} ${inq.intakeYear}`
          : inq.intakeYear
            ? String(inq.intakeYear)
            : null;
      return {
        trackingId: inq.referenceNumber,
        preferredCountry: inq.preferredCountry?.name ?? null,
        preferredUniversity: inq.preferredUniversity?.name ?? null,
        intendedProgram: inq.intendedProgram,
        intake,
        statusLabel: INQUIRY_STATUS_META[status].label,
        submittedAt: inq.createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });
  },
};

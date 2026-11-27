import { InquiryStatus } from '@prisma/client';
import type { InquiryStatusType } from '@zero-compile/shared';

const PRISMA_TO_DTO_STATUS: Record<InquiryStatus, InquiryStatusType> = {
  [InquiryStatus.new]: 'new',
  [InquiryStatus.assigned]: 'assigned',
  [InquiryStatus.in_review]: 'in-review',
  [InquiryStatus.documents_requested]: 'documents-requested',
  [InquiryStatus.documents_received]: 'documents-received',
  [InquiryStatus.processing]: 'processing',
  [InquiryStatus.approved]: 'approved',
  [InquiryStatus.rejected]: 'rejected',
  [InquiryStatus.closed]: 'closed',
};

const DTO_TO_PRISMA_STATUS: Record<InquiryStatusType, InquiryStatus> = {
  new: InquiryStatus.new,
  assigned: InquiryStatus.assigned,
  'in-review': InquiryStatus.in_review,
  'documents-requested': InquiryStatus.documents_requested,
  'documents-received': InquiryStatus.documents_received,
  processing: InquiryStatus.processing,
  approved: InquiryStatus.approved,
  rejected: InquiryStatus.rejected,
  closed: InquiryStatus.closed,
};

export function toDtoInquiryStatus(status: InquiryStatus): InquiryStatusType {
  return PRISMA_TO_DTO_STATUS[status];
}

export function toPrismaInquiryStatus(status: InquiryStatusType): InquiryStatus {
  return DTO_TO_PRISMA_STATUS[status];
}

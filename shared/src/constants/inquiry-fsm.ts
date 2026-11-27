import type { UserRoleType } from './rbac';

export const INQUIRY_STATUSES = [
  'new',
  'assigned',
  'in-review',
  'documents-requested',
  'documents-received',
  'processing',
  'approved',
  'rejected',
  'closed',
] as const;

export type InquiryStatusType = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type InquiryPriorityType = (typeof INQUIRY_PRIORITIES)[number];

export const INQUIRY_CATEGORIES = [
  'general',
  'application',
  'visa',
  'scholarship',
  'accommodation',
  'other',
] as const;
export type InquiryCategoryType = (typeof INQUIRY_CATEGORIES)[number];

export const INTAKE_SEMESTERS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export type IntakeSemesterType = (typeof INTAKE_SEMESTERS)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<InquiryStatusType, readonly InquiryStatusType[]> = {
  new: ['assigned', 'in-review', 'closed'],
  assigned: ['in-review', 'documents-requested', 'closed'],
  'in-review': ['documents-requested', 'documents-received', 'processing', 'closed'],
  'documents-requested': ['documents-received', 'in-review', 'closed'],
  'documents-received': ['documents-requested', 'processing', 'in-review', 'closed'],
  processing: ['approved', 'rejected', 'documents-requested', 'closed'],
  approved: ['closed'],
  rejected: ['in-review', 'closed'],
  closed: ['in-review'],
};

const SUPER_ADMIN_RESTRICTED_STATUSES: ReadonlySet<InquiryStatusType> = new Set([
  'closed',
  'rejected',
]);

export function canTransitionStatus(
  fromStatus: InquiryStatusType,
  toStatus: InquiryStatusType,
  actorRole: UserRoleType
): { allowed: boolean; reason?: string } {
  if (fromStatus === toStatus) {
    return { allowed: false, reason: `Inquiry is already in '${toStatus}' status.` };
  }

  const allowedTargets = ALLOWED_STATUS_TRANSITIONS[fromStatus];
  if (!allowedTargets.includes(toStatus)) {
    return {
      allowed: false,
      reason: `Transition from '${fromStatus}' to '${toStatus}' is not permitted.`,
    };
  }

  if (
    actorRole !== 'super-admin' &&
    (SUPER_ADMIN_RESTRICTED_STATUSES.has(fromStatus) || SUPER_ADMIN_RESTRICTED_STATUSES.has(toStatus))
  ) {
    return {
      allowed: false,
      reason: `Only a Super Admin can transition inquiries from or to '${fromStatus === 'closed' || fromStatus === 'rejected' ? fromStatus : toStatus}'.`,
    };
  }

  return { allowed: true };
}

export const INQUIRY_STATUS_META: Record<
  InquiryStatusType,
  { label: string; description: string; advisoryNote: string }
> = {
  new: {
    label: 'Application Received',
    description: 'Your inquiry has been logged in our admissions queue and is awaiting counselor assignment.',
    advisoryNote: 'A dedicated education counselor will be assigned to your case shortly.',
  },
  assigned: {
    label: 'Counselor Assigned',
    description: 'An education counselor has been assigned to review your academic profile and preferences.',
    advisoryNote: 'Your counselor is preparing an initial assessment of your study options.',
  },
  'in-review': {
    label: 'Under Academic Evaluation',
    description: 'Our admissions committee is evaluating your academic grades, program options, and scholarship eligibility.',
    advisoryNote: 'Your designated counselor will reach out if additional academic details are needed.',
  },
  'documents-requested': {
    label: 'Documents Requested',
    description: 'Additional academic transcripts, test scores, or supporting documents are required to proceed.',
    advisoryNote: 'Please share the requested documents with your counselor promptly to avoid intake delays.',
  },
  'documents-received': {
    label: 'Documents Under Verification',
    description: 'We have received your supporting documents and are verifying them against university requirements.',
    advisoryNote: 'Once verified, your application will move to formal submission.',
  },
  processing: {
    label: 'University Submission & Processing',
    description: 'Your application is actively being processed with the target institution and/or visa desk.',
    advisoryNote: 'We are monitoring institutional updates and will notify you upon decision.',
  },
  approved: {
    label: 'Offer / Outcome Approved',
    description: 'Your application has received a positive outcome. Congratulations!',
    advisoryNote: 'Your counselor will guide you through enrollment confirmation and pre-departure steps.',
  },
  rejected: {
    label: 'Not Approved',
    description: 'Unfortunately, this application did not receive an approval for the selected criteria.',
    advisoryNote: 'Contact your counselor to explore alternative universities or upcoming intakes.',
  },
  closed: {
    label: 'Case Closed',
    description: 'This inquiry case has been finalized and archived.',
    advisoryNote: 'You may submit a new inquiry anytime if you wish to start a fresh application.',
  },
};

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildTrackingTimeline(
  currentStatus: InquiryStatusType,
  submittedAt: Date,
  lastUpdatedAt: Date
): TimelineStep[] {
  const stageIndexMap: Record<InquiryStatusType, number> = {
    new: 0,
    assigned: 1,
    'in-review': 1,
    'documents-requested': 2,
    'documents-received': 2,
    processing: 3,
    approved: 4,
    rejected: 4,
    closed: 4,
  };

  const activeIdx = stageIndexMap[currentStatus];
  const steps = [
    {
      id: '1',
      title: 'Application Received',
      description: 'Inquiry logged with unique tracking reference.',
    },
    {
      id: '2',
      title: 'Counselor Review & Assessment',
      description: 'Academic profile and destination eligibility evaluation.',
    },
    {
      id: '3',
      title: 'Document Vetting & Verification',
      description: 'Verification of transcripts, English proficiency, and SOPs.',
    },
    {
      id: '4',
      title: 'University Submission & Visa Filing',
      description: 'Formal application dispatch and visa preparation.',
    },
    {
      id: '5',
      title: 'Offer & Final Outcome',
      description: 'Final admissions decision and case completion.',
    },
  ];

  return steps.map((step, index) => {
    let status: TimelineStep['status'] = 'pending';
    if (index < activeIdx || (index === 4 && activeIdx === 4)) {
      status = index === activeIdx && currentStatus !== 'approved' && currentStatus !== 'closed' && currentStatus !== 'rejected'
        ? 'current'
        : 'completed';
    } else if (index === activeIdx) {
      status = 'current';
    }

    const date =
      index === 0
        ? formatShortDate(submittedAt)
        : index === activeIdx
          ? formatShortDate(lastUpdatedAt)
          : undefined;

    return { ...step, status, ...(date ? { date } : {}) };
  });
}

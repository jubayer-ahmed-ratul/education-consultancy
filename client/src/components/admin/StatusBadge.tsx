import type { InquiryStatusType } from '@zero-compile/shared';

const STATUS_STYLES: Record<InquiryStatusType, string> = {
  new: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  assigned: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'in-review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'documents-requested': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'documents-received': 'bg-teal-50 text-teal-700 ring-teal-600/20',
  processing: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  closed: 'bg-gray-100 text-gray-700 ring-gray-600/20',
};

export function StatusBadge({ status }: { status: InquiryStatusType }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status.replace(/-/g, ' ')}
    </span>
  );
}

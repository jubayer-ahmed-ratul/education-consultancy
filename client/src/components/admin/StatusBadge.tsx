import type { InquiryStatusType } from '@zero-compile/shared';

const STATUS_STYLES: Record<InquiryStatusType, string> = {
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'in-review': 'bg-amber-50 text-amber-800 border-amber-200',
  'documents-requested': 'bg-orange-50 text-orange-800 border-orange-200',
  'documents-received': 'bg-teal-50 text-teal-800 border-teal-200',
  processing: 'bg-violet-50 text-violet-800 border-violet-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function StatusBadge({ status }: { status: InquiryStatusType }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

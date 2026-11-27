import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, ChevronUp, FileText, Trash2, UserCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ALLOWED_STATUS_TRANSITIONS,
  canTransitionStatus,
  type InquiryStatusType,
} from '@zero-compile/shared';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface InquiryDetail {
  id: string;
  referenceNumber: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string | null;
  studentNationality: string | null;
  currentEducationLevel: string;
  fieldOfStudy: string | null;
  gpa: string | null;
  englishProficiency: string | null;
  intendedProgram: string | null;
  intakeYear: number | null;
  intakeSemester: string | null;
  category: string;
  message: string;
  status: InquiryStatusType;
  priority: string;
  assignedToId: string | null;
  preferredCountry?: { name: string } | null;
  preferredUniversity?: { name: string } | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: { name: string; email: string };
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    storageKey: string;
    createdAt: string;
  }>;
  auditHistory: Array<{
    id: string;
    action: string;
    createdAt: string;
    details: Record<string, unknown>;
    performedBy?: { name: string; email: string } | null;
  }>;
}

export default function InquiryDetailPage() {
  const { id = '' } = useParams();
  const { user, can } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [noteContent, setNoteContent] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [docForm, setDocForm] = useState({ fileName: '', fileType: 'application/pdf', storageKey: '' });
  const [auditOpen, setAuditOpen] = useState(false);

  const { data: inquiryRes, isLoading } = useQuery({
    queryKey: queryKeys.inquiries.detail(id),
    queryFn: () => apiRequest<InquiryDetail>(`/inquiries/${id}`),
    enabled: Boolean(id),
  });

  const { data: staffRes } = useQuery({
    queryKey: queryKeys.users.list({ isActive: true }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; email: string; role: string }>>('/users?isActive=true&limit=100'),
    enabled: can('inquiries:assign'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: InquiryStatusType) =>
      apiRequest(`/inquiries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      addToast('success', 'Inquiry status updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Status update failed.'),
  });

  const assignMutation = useMutation({
    mutationFn: (assignedTo: string) =>
      apiRequest(`/inquiries/${id}/assign`, { method: 'PUT', body: JSON.stringify({ assignedTo }) }),
    onSuccess: () => {
      addToast('success', 'Counselor assigned.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Assignment failed.'),
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest(`/inquiries/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: () => {
      setNoteContent('');
      addToast('success', 'Internal note added.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.detail(id) });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Failed to add note.'),
  });

  const addDocMutation = useMutation({
    mutationFn: (payload: typeof docForm) =>
      apiRequest(`/inquiries/${id}/documents`, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      setDocForm({ fileName: '', fileType: 'application/pdf', storageKey: '' });
      addToast('success', 'Document linked.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.detail(id) });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Failed to link document.'),
  });

  const removeDocMutation = useMutation({
    mutationFn: (docId: string) => apiRequest(`/inquiries/${id}/documents/${docId}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'Document removed.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.detail(id) });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const inq = inquiryRes?.data;
  if (!inq) return <div className="text-sm text-rose-700">Inquiry not found.</div>;

  const allowedTargets = ALLOWED_STATUS_TRANSITIONS[inq.status].filter(
    (target) => user && canTransitionStatus(inq.status, target, user.role).allowed
  );

  function handleNoteSubmit(e: FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    noteMutation.mutate(noteContent.trim());
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{inq.referenceNumber} â€” StudySphere Admin</title>
      </Helmet>

      {/* Filament Breadcrumbs + Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Link to="/admin/inquiries" className="hover:text-gray-900">Inquiries</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-mono">{inq.referenceNumber}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-900">View</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-gray-950">{inq.referenceNumber}</h1>
          <StatusBadge status={inq.status} />
          <Badge variant="outline" className="capitalize">{inq.category}</Badge>
        </div>
      </div>

      {/* Filament 2-Column Infolist + Workflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Infolist</CardTitle>
              <CardDescription>Verified student profile, academic credentials, and target institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Reference ID</dt>
                  <dd className="mt-1 font-mono font-semibold text-teal-700">{inq.referenceNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Student Name</dt>
                  <dd className="mt-1 font-medium text-gray-950">{inq.studentFirstName} {inq.studentLastName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 text-gray-900">{inq.studentEmail}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Phone / Nationality</dt>
                  <dd className="mt-1 text-gray-900">{inq.studentPhone || 'â€”'} / {inq.studentNationality || 'â€”'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Academic Background</dt>
                  <dd className="mt-1 text-gray-900">
                    {inq.currentEducationLevel} â€¢ {inq.fieldOfStudy || 'â€”'} (GPA: {inq.gpa || 'â€”'})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">English Proficiency</dt>
                  <dd className="mt-1 text-gray-900">{inq.englishProficiency || 'â€”'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Target Destination</dt>
                  <dd className="mt-1 text-gray-900">{inq.preferredCountry?.name || 'â€”'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Target University & Program</dt>
                  <dd className="mt-1 text-gray-900">
                    {inq.preferredUniversity?.name || 'â€”'} â€¢ {inq.intendedProgram || 'â€”'} ({inq.intakeSemester || ''} {inq.intakeYear || ''})
                  </dd>
                </div>
              </dl>

              <div className="border-t border-gray-950/5 pt-4">
                <div className="text-xs font-medium text-gray-500 mb-1">Inquiry Statement</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">{inq.message}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" /> Document Checklist ({inq.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inq.documents.length > 0 && (
                <ul className="divide-y divide-gray-950/5 rounded-lg ring-1 ring-gray-950/5">
                  {inq.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-gray-950">{doc.fileName}</div>
                        <div className="truncate text-gray-500">{doc.storageKey}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocMutation.mutate(doc.id)}
                        className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addDocMutation.mutate(docForm);
                }}
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 pt-2"
              >
                <Input
                  required
                  placeholder="File name (e.g. IELTS.pdf)"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm((d) => ({ ...d, fileName: e.target.value }))}
                />
                <Input
                  required
                  placeholder="Storage key or URL"
                  value={docForm.storageKey}
                  onChange={(e) => setDocForm((d) => ({ ...d, storageKey: e.target.value }))}
                />
                <Button type="submit" disabled={addDocMutation.isPending}>
                  Add Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Workflow & Counselor Assignment */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Transitions</CardTitle>
              <CardDescription>Advance inquiry lifecycle status.</CardDescription>
            </CardHeader>
            <CardContent>
              {!allowedTargets.length ? (
                <p className="text-xs text-gray-500">
                  No transitions available for your role from <code>{inq.status}</code>.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowedTargets.map((target) => (
                    <Button
                      key={target}
                      size="sm"
                      variant={target === 'rejected' || target === 'closed' ? 'secondary' : 'default'}
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate(target)}
                      className="capitalize"
                    >
                      {target.replace(/-/g, ' ')}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {can('inquiries:assign') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-teal-600" /> Counselor Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-500">
                  Assigned to: <strong className="text-gray-950">{inq.assignedTo?.name ?? 'Unassigned'}</strong>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedCounselor || inq.assignedToId || ''}
                    onChange={(e) => setSelectedCounselor(e.target.value)}
                  >
                    <option value="">Select staff...</option>
                    {staffRes?.data.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </Select>
                  <Button
                    disabled={!selectedCounselor || assignMutation.isPending}
                    onClick={() => assignMutation.mutate(selectedCounselor)}
                  >
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes ({inq.notes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleNoteSubmit} className="space-y-2.5">
                <Textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write an internal counselor note..."
                />
                <Button type="submit" size="sm" disabled={noteMutation.isPending || !noteContent.trim()} className="w-full">
                  {noteMutation.isPending ? 'Saving...' : 'Save Note'}
                </Button>
              </form>

              <div className="max-h-64 space-y-2.5 overflow-y-auto border-t border-gray-950/5 pt-3">
                {inq.notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-gray-50 p-3 text-xs ring-1 ring-gray-950/5">
                    <div className="flex items-center justify-between font-semibold text-gray-950">
                      <span>{n.createdBy.name}</span>
                      <span className="font-mono text-[10px] font-normal text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{n.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <button
              type="button"
              onClick={() => setAuditOpen((o) => !o)}
              className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-950 cursor-pointer"
            >
              <span>Activity Log ({inq.auditHistory.length})</span>
              {auditOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {auditOpen && (
              <CardContent className="border-t border-gray-950/5 max-h-64 overflow-y-auto space-y-2.5">
                {inq.auditHistory.map((log) => (
                  <div key={log.id} className="border-b border-gray-950/5 pb-2 text-xs last:border-0">
                    <div className="font-mono font-semibold text-teal-700">{log.action}</div>
                    <div className="text-gray-500">
                      {log.performedBy?.name ?? 'Public / System'} â€¢{' '}
                      <span className="font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

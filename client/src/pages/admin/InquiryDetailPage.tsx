import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Trash2, UserCheck } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
    queryFn: () => apiRequest<Array<{ id: string; name: string; email: string; role: string }>>('/users?isActive=true&limit=100'),
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
      addToast('success', 'Note added.');
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
        <title>{inq.referenceNumber} — Zero Compile Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/inquiries" className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Inquiries Queue
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-[#111827]">{inq.referenceNumber}</h1>
            <StatusBadge status={inq.status} />
            <Badge variant="outline" className="capitalize">{inq.category}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Profile & Documents */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Student & Academic Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div><span className="text-xs text-[#6B7280] block">Full Name</span>{inq.studentFirstName} {inq.studentLastName}</div>
                <div><span className="text-xs text-[#6B7280] block">Email</span>{inq.studentEmail}</div>
                <div><span className="text-xs text-[#6B7280] block">Phone</span>{inq.studentPhone || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">Nationality</span>{inq.studentNationality || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">Education Level</span>{inq.currentEducationLevel}</div>
                <div><span className="text-xs text-[#6B7280] block">Field / GPA</span>{inq.fieldOfStudy || '—'} / {inq.gpa || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">English Proficiency</span>{inq.englishProficiency || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">Destination</span>{inq.preferredCountry?.name || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">University</span>{inq.preferredUniversity?.name || '—'}</div>
                <div><span className="text-xs text-[#6B7280] block">Program / Intake</span>{inq.intendedProgram || '—'} ({inq.intakeSemester || ''} {inq.intakeYear || ''})</div>
              </div>
              <div className="border-t border-[#E5E2DC] pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                  Inquiry Statement
                </div>
                <p className="whitespace-pre-wrap text-sm text-[#111827]">{inq.message}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0D3B2E]" /> Attached Documents ({inq.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inq.documents.length > 0 && (
                <ul className="space-y-2">
                  {inq.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between rounded-md border border-[#E5E2DC] bg-[#FAF9F6] px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-[#111827]">{doc.fileName}</div>
                        <div className="truncate text-[#6B7280]">{doc.storageKey}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocMutation.mutate(doc.id)}
                        className="h-7 w-7 text-rose-600"
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
                className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-2 border-t border-[#E5E2DC]"
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

        {/* Right Column: Sticky Actions, Assignment, Notes & Collapsible Audit */}
        <div className="space-y-5 lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>State-Machine Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {!allowedTargets.length ? (
                  <p className="text-xs text-[#6B7280]">
                    No transitions available for your role from <code>{inq.status}</code>.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allowedTargets.map((target) => (
                      <Button
                        key={target}
                        size="sm"
                        variant={target === 'rejected' || target === 'closed' ? 'outline' : 'default'}
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate(target)}
                        className="capitalize"
                      >
                        Move to {target}
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
                    <UserCheck className="h-4 w-4 text-[#0D3B2E]" /> Counselor Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="text-xs text-[#6B7280]">
                    Currently assigned: <strong className="text-[#111827]">{inq.assignedTo?.name ?? 'Unassigned'}</strong>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCounselor || inq.assignedToId || ''}
                      onChange={(e) => setSelectedCounselor(e.target.value)}
                    >
                      <option value="">Select counselor...</option>
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
                <form onSubmit={handleNoteSubmit} className="space-y-2">
                  <Textarea
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Record counselor assessment or call summary..."
                  />
                  <Button type="submit" size="sm" disabled={noteMutation.isPending || !noteContent.trim()} className="w-full">
                    {noteMutation.isPending ? 'Saving...' : 'Add Internal Note'}
                  </Button>
                </form>

                <div className="max-h-64 space-y-2.5 overflow-y-auto border-t border-[#E5E2DC] pt-3">
                  {inq.notes.map((n) => (
                    <div key={n.id} className="rounded-md border border-[#E5E2DC] bg-[#FAF9F6] p-3 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#111827]">
                        <span>{n.createdBy.name}</span>
                        <span className="font-mono text-[10px] font-normal text-[#6B7280]">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-[#4B5563]">{n.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <button
                type="button"
                onClick={() => setAuditOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-bold text-[#111827] cursor-pointer"
              >
                <span>Audit Trail ({inq.auditHistory.length})</span>
                {auditOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {auditOpen && (
                <CardContent className="border-t border-[#E5E2DC] max-h-64 overflow-y-auto space-y-2.5">
                  {inq.auditHistory.map((log) => (
                    <div key={log.id} className="border-b border-[#E5E2DC] pb-2 text-xs last:border-0">
                      <div className="font-mono font-semibold text-[#0D3B2E]">{log.action}</div>
                      <div className="text-[#6B7280]">
                        {log.performedBy?.name ?? 'Public / System'} •{' '}
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
    </div>
  );
}

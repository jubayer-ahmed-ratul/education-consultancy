import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock, KeyRound, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { TimelineStep } from '@zero-compile/shared';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';

interface TrackResult {
  trackingId: string;
  studentName: string;
  preferredCountry: string | null;
  preferredUniversity: string | null;
  intendedProgram: string | null;
  intake: string | null;
  status: string;
  statusLabel: string;
  statusDescription: string;
  submittedAt: string;
  lastUpdatedAt: string;
  timeline: TimelineStep[];
  advisoryNote: string;
}

interface RecoveredApp {
  trackingId: string;
  preferredCountry: string | null;
  preferredUniversity: string | null;
  intendedProgram: string | null;
  intake: string | null;
  statusLabel: string;
  submittedAt: string;
}

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [tab, setTab] = useState<'track' | 'recover'>('track');
  const [trackingId, setTrackingId] = useState(searchParams.get('ref') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);

  const [recoverEmail, setRecoverEmail] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [recoveredApps, setRecoveredApps] = useState<RecoveredApp[] | null>(null);

  const trackMutation = useMutation({
    mutationFn: () =>
      apiRequest<TrackResult>('/inquiries/track', {
        method: 'POST',
        body: JSON.stringify({ trackingId, email }),
      }),
    onSuccess: (res) => setTrackResult(res.data),
    onError: (err) => {
      setTrackResult(null);
      addToast('error', err instanceof Error ? err.message : 'Application not found.');
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ message: string }>('/inquiries/recover/request', {
        method: 'POST',
        body: JSON.stringify({ email: recoverEmail }),
      }),
    onSuccess: (res) => {
      setOtpSentMessage(res.data.message);
      setRecoveredApps(null);
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Request failed.'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () =>
      apiRequest<RecoveredApp[]>('/inquiries/recover/verify', {
        method: 'POST',
        body: JSON.stringify({ email: recoverEmail, code: otpCode }),
      }),
    onSuccess: (res) => {
      setRecoveredApps(res.data);
      addToast('success', 'Applications retrieved.');
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Verification failed.'),
  });

  function handleTrack(e: FormEvent) {
    e.preventDefault();
    trackMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Track Application â€” StudySphere</title>
      </Helmet>

      <div className="space-y-1 border-b border-zinc-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Self-Service Portal
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          Application Status & Recovery
        </h1>
        <p className="text-sm text-zinc-700">
          Check live admissions progress or recover a lost{' '}
          <code className="font-semibold text-teal-700">ZRC-YYYY-XXX</code> reference code.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'track' | 'recover')}>
        <TabsList>
          <TabsTrigger value="track" className="gap-2">
            <Search className="h-3.5 w-3.5" /> Track Application
          </TabsTrigger>
          <TabsTrigger value="recover" className="gap-2">
            <KeyRound className="h-3.5 w-3.5" /> Recover Reference Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="mt-5 space-y-6">
          <form
            onSubmit={handleTrack}
            className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10"
          >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Input
                type="text"
                required
                placeholder="Tracking ID (e.g. ZRC-2026-001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Input
                type="email"
                required
                placeholder="Registered Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={trackMutation.isPending}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {trackMutation.isPending ? 'Checking...' : 'Check Status'}
            </Button>
          </form>

          {trackResult && (
            <div className="space-y-6 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                <div>
                  <div className="font-mono text-xl font-bold text-zinc-950">
                    {trackResult.trackingId}
                  </div>
                  <div className="text-xs text-zinc-600">Applicant: {trackResult.studentName}</div>
                </div>
                <Badge variant="success" className="bg-teal-50 text-teal-700 border-teal-200">
                  {trackResult.statusLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#F8FAFC] p-4 text-xs text-zinc-700 ring-1 ring-zinc-950/10 sm:grid-cols-2">
                <div>
                  <strong className="text-zinc-950">Country:</strong>{' '}
                  {trackResult.preferredCountry || 'â€”'}
                </div>
                <div>
                  <strong className="text-zinc-950">University:</strong>{' '}
                  {trackResult.preferredUniversity || 'â€”'}
                </div>
                <div>
                  <strong className="text-zinc-950">Program:</strong>{' '}
                  {trackResult.intendedProgram || 'â€”'}
                </div>
                <div>
                  <strong className="text-zinc-950">Intake:</strong> {trackResult.intake || 'â€”'}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-zinc-700">
                {trackResult.statusDescription}
              </p>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  5-Stage Progress Timeline
                </h2>
                <ol className="space-y-2.5">
                  {trackResult.timeline.map((step) => (
                    <li
                      key={step.id}
                      className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${
                        step.status === 'completed'
                          ? 'border-teal-200 bg-teal-50/70'
                          : step.status === 'current'
                            ? 'border-amber-300 bg-amber-50/70'
                            : 'border-zinc-200 bg-[#F8FAFC] text-zinc-600'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                        ) : step.status === 'current' ? (
                          <Clock className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-zinc-950">
                          <span>
                            {step.id}. {step.title}
                          </span>
                          <span className="font-mono text-[11px] uppercase text-zinc-600">
                            {step.status}
                            {step.date ? ` â€¢ ${step.date}` : ''}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-700">{step.description}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg bg-[#F8FAFC] p-4 text-xs text-zinc-700 ring-1 ring-zinc-950/10">
                <strong className="text-zinc-950">Advisory Note:</strong> {trackResult.advisoryNote}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recover" className="mt-5 space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestOtpMutation.mutate();
            }}
            className="space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10"
          >
            <h2 className="font-display text-sm font-bold text-zinc-950">
              Step 1: Request 6-Digit Verification Code
            </h2>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Input
                type="email"
                required
                placeholder="Enter your application email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {requestOtpMutation.isPending ? 'Sending...' : 'Send Code'}
              </Button>
            </div>
            {otpSentMessage && (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                {otpSentMessage}
              </div>
            )}
          </form>

          {otpSentMessage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtpMutation.mutate();
              }}
              className="space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10"
            >
              <h2 className="font-display text-sm font-bold text-zinc-950">
                Step 2: Enter 6-Digit Code
              </h2>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
            </form>
          )}

          {recoveredApps && (
            <div className="space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
              <h2 className="font-display text-sm font-bold text-zinc-950">
                Recovered Applications ({recoveredApps.length})
              </h2>
              <ul className="divide-y divide-zinc-200 text-sm">
                {recoveredApps.map((app) => (
                  <li key={app.trackingId} className="flex items-center justify-between py-3">
                    <div>
                      <span className="font-mono font-bold text-teal-700">{app.trackingId}</span>{' '}
                      <span className="text-xs font-medium text-zinc-950">â€” {app.statusLabel}</span>
                      <div className="text-xs text-zinc-600">
                        {app.preferredCountry || 'General'} â€¢ Submitted {app.submittedAt}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTrackingId(app.trackingId);
                        setEmail(recoverEmail);
                        setTab('track');
                      }}
                    >
                      Track
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

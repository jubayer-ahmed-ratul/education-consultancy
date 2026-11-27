import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock, KeyRound, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { TimelineStep } from '@zero-compile/shared';
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Track Application — Zero Compile</title>
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-5 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Self-Service Portal</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">Application Status & Recovery</h1>
        <p className="text-sm text-[#4B5563]">
          Check live admissions progress or recover a lost <code className="text-[#0D3B2E]">ZRC-YYYY-XXX</code> reference code.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('track')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'track'
              ? 'bg-[#0D3B2E] text-white'
              : 'border border-[#CFCAC0] bg-white text-[#4B5563] hover:bg-[#F3F1EC]'
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Track Application
        </button>
        <button
          type="button"
          onClick={() => setTab('recover')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'recover'
              ? 'bg-[#0D3B2E] text-white'
              : 'border border-[#CFCAC0] bg-white text-[#4B5563] hover:bg-[#F3F1EC]'
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" /> Recover Reference Code
        </button>
      </div>

      {tab === 'track' ? (
        <div className="space-y-6">
          <form onSubmit={handleTrack} className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Tracking ID (e.g. ZRC-2026-001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                className="rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 font-mono text-sm focus:border-[#0D3B2E] focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Registered Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 text-sm focus:border-[#0D3B2E] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={trackMutation.isPending}
              className="rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20] disabled:opacity-50"
            >
              {trackMutation.isPending ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {trackResult && (
            <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2DC] pb-4">
                <div>
                  <div className="font-mono text-xl font-bold text-[#111827]">{trackResult.trackingId}</div>
                  <div className="text-xs text-[#6B7280]">Applicant: {trackResult.studentName}</div>
                </div>
                <span className="rounded-full bg-[#FEF3C7] px-3.5 py-1 text-xs font-semibold text-[#B45309]">
                  {trackResult.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-md border border-[#E5E2DC] bg-[#FAF9F6] p-4 text-xs text-[#4B5563] sm:grid-cols-2">
                <div><strong className="text-[#111827]">Country:</strong> {trackResult.preferredCountry || '—'}</div>
                <div><strong className="text-[#111827]">University:</strong> {trackResult.preferredUniversity || '—'}</div>
                <div><strong className="text-[#111827]">Program:</strong> {trackResult.intendedProgram || '—'}</div>
                <div><strong className="text-[#111827]">Intake:</strong> {trackResult.intake || '—'}</div>
              </div>

              <p className="text-sm leading-relaxed text-[#4B5563]">{trackResult.statusDescription}</p>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  5-Stage Progress Timeline
                </h2>
                <ol className="space-y-2.5">
                  {trackResult.timeline.map((step) => (
                    <li
                      key={step.id}
                      className={`flex items-start gap-3 rounded-md border p-3.5 text-sm ${
                        step.status === 'completed'
                          ? 'border-emerald-200 bg-emerald-50/70'
                          : step.status === 'current'
                            ? 'border-amber-300 bg-amber-50/70'
                            : 'border-[#E5E2DC] bg-[#FAF9F6] text-[#6B7280]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#0D3B2E]" />
                        ) : step.status === 'current' ? (
                          <Clock className="h-4 w-4 text-[#D97706]" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#CFCAC0]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-[#111827]">
                          <span>{step.id}. {step.title}</span>
                          <span className="font-mono text-[11px] uppercase text-[#6B7280]">
                            {step.status}{step.date ? ` • ${step.date}` : ''}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-[#4B5563]">{step.description}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-md border border-[#E5E2DC] bg-[#F3F1EC] p-4 text-xs text-[#4B5563]">
                <strong className="text-[#111827]">Advisory Note:</strong> {trackResult.advisoryNote}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestOtpMutation.mutate();
            }}
            className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-3"
          >
            <h2 className="font-display text-sm font-bold text-[#111827]">
              Step 1: Request 6-Digit Verification Code
            </h2>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                required
                placeholder="Enter your application email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                className="flex-1 rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 text-sm focus:border-[#0D3B2E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="rounded-md bg-[#0D3B2E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#092A20] disabled:opacity-50"
              >
                {requestOtpMutation.isPending ? 'Sending...' : 'Send Code'}
              </button>
            </div>
            {otpSentMessage && (
              <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
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
              className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-3"
            >
              <h2 className="font-display text-sm font-bold text-[#111827]">
                Step 2: Enter 6-Digit Code
              </h2>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="flex-1 rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 font-mono text-sm focus:border-[#0D3B2E] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="rounded-md bg-[#0D3B2E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#092A20] disabled:opacity-50"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {recoveredApps && (
            <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-3">
              <h2 className="font-display text-sm font-bold text-[#111827]">
                Recovered Applications ({recoveredApps.length})
              </h2>
              <ul className="divide-y divide-[#E5E2DC] text-sm">
                {recoveredApps.map((app) => (
                  <li key={app.trackingId} className="flex items-center justify-between py-3">
                    <div>
                      <span className="font-mono font-bold text-[#0D3B2E]">{app.trackingId}</span>{' '}
                      <span className="text-xs font-medium text-[#111827]">— {app.statusLabel}</span>
                      <div className="text-xs text-[#6B7280]">
                        {app.preferredCountry || 'General'} • Submitted {app.submittedAt}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingId(app.trackingId);
                        setEmail(recoverEmail);
                        setTab('track');
                      }}
                      className="rounded-md border border-[#CFCAC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F1EC]"
                    >
                      Track
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, CheckCircle2, Copy } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  INQUIRY_CATEGORIES,
  INTAKE_SEMESTERS,
  type InquiryCategoryType,
  type IntakeSemesterType,
} from '@zero-compile/shared';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

export default function ApplyPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [currentEducationLevel, setCurrentEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [gpa, setGpa] = useState('');
  const [englishProficiency, setEnglishProficiency] = useState('');
  const [preferredCountry, setPreferredCountry] = useState(searchParams.get('country') || '');
  const [preferredUniversity, setPreferredUniversity] = useState(searchParams.get('university') || '');
  const [intendedProgram, setIntendedProgram] = useState('');
  const [intakeSemester, setIntakeSemester] = useState<string>('');
  const [intakeYear, setIntakeYear] = useState('');
  const [category, setCategory] = useState<InquiryCategoryType>('application');
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>('/countries?page=1&limit=100'),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ country: preferredCountry || 'all' }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; countryId: string }>>(
        `/universities?page=1&limit=100${preferredCountry ? `&country=${preferredCountry}` : ''}`
      ),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiRequest<{ referenceNumber: string; status: string; message: string }>('/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      setSubmittedRef(res.data.referenceNumber);
      addToast('success', `Inquiry submitted: ${res.data.referenceNumber}`);
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Submission failed.'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMutation.mutate({
      student: {
        firstName,
        lastName,
        email,
        phone: phone.trim() || null,
        nationality: nationality.trim() || null,
      },
      academic: {
        currentEducationLevel,
        fieldOfStudy: fieldOfStudy.trim() || null,
        gpa: gpa.trim() || null,
        englishProficiency: englishProficiency.trim() || null,
      },
      preferredCountry: preferredCountry || null,
      preferredUniversity: preferredUniversity || null,
      intendedProgram: intendedProgram.trim() || null,
      intakeYear: intakeYear ? Number(intakeYear) : null,
      intakeSemester: (intakeSemester as IntakeSemesterType) || null,
      category,
      message,
    });
  }

  async function copyReference() {
    if (!submittedRef) return;
    await navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    addToast('info', 'Reference code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  }

  if (submittedRef) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <Helmet>
          <title>Inquiry Submitted — Zero Compile</title>
        </Helmet>
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-8 space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#0D3B2E]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0D3B2E]">Application Logged</div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">Inquiry Received</h1>
            <p className="text-sm text-[#4B5563]">
              Save your unique reference code below to track your application status anytime:
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-md border border-[#E5E2DC] bg-[#FAF9F6] px-4 py-3.5">
            <span className="font-mono text-xl font-bold text-[#0D3B2E]">{submittedRef}</span>
            <button
              type="button"
              onClick={copyReference}
              className="inline-flex items-center gap-1 rounded border border-[#CFCAC0] bg-white px-2.5 py-1 text-xs font-medium text-[#111827] hover:bg-[#F3F1EC]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#0D3B2E]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to={`/track?ref=${encodeURIComponent(submittedRef)}&email=${encodeURIComponent(email)}`}
              className="inline-flex items-center gap-2 rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20]"
            >
              Track Application <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setMessage('');
              }}
              className="rounded-md border border-[#CFCAC0] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F3F1EC]"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0D3B2E] focus:outline-none';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Apply Online — Zero Compile</title>
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-5 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Online Admissions</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">Submit Admissions Inquiry</h1>
        <p className="text-sm text-[#4B5563]">
          Complete your academic profile below. You will receive a <code className="text-[#0D3B2E]">ZRC-YYYY-XXX</code> tracking code immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#0D3B2E]">
            01. Student Details
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <input type="text" required placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            <input type="text" required placeholder="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            <input type="email" required placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className={`${inputClass} sm:col-span-2`} />
          </div>
        </div>

        <div className="space-y-3 border-t border-[#E5E2DC] pt-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#0D3B2E]">
            02. Academic Background
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <input type="text" required placeholder="Current Education Level (e.g. Bachelor's, HSC) *" value={currentEducationLevel} onChange={(e) => setCurrentEducationLevel(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Field of Study" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className={inputClass} />
            <input type="text" placeholder="GPA / Percentage" value={gpa} onChange={(e) => setGpa(e.target.value)} className={inputClass} />
            <input type="text" placeholder="English Proficiency (e.g. IELTS 7.0)" value={englishProficiency} onChange={(e) => setEnglishProficiency(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="space-y-3 border-t border-[#E5E2DC] pt-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#0D3B2E]">
            03. Study Preferences
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <select
              value={preferredCountry}
              onChange={(e) => {
                setPreferredCountry(e.target.value);
                setPreferredUniversity('');
              }}
              className={inputClass}
            >
              <option value="">Preferred Destination (Optional)</option>
              {countriesRes?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={preferredUniversity}
              onChange={(e) => setPreferredUniversity(e.target.value)}
              className={inputClass}
            >
              <option value="">Preferred University (Optional)</option>
              {universitiesRes?.data.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <input type="text" placeholder="Intended Program (e.g. MSc Data Science)" value={intendedProgram} onChange={(e) => setIntendedProgram(e.target.value)} className={inputClass} />

            <select value={category} onChange={(e) => setCategory(e.target.value as InquiryCategoryType)} className={inputClass}>
              {INQUIRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select value={intakeSemester} onChange={(e) => setIntakeSemester(e.target.value)} className={inputClass}>
              <option value="">Intake Semester (Optional)</option>
              {INTAKE_SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <input type="number" min={2020} max={2050} placeholder="Intake Year (e.g. 2026)" value={intakeYear} onChange={(e) => setIntakeYear(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2 border-t border-[#E5E2DC] pt-5">
          <label className="block font-display text-sm font-bold uppercase tracking-wider text-[#0D3B2E]">
            04. Statement / Inquiry Message *
          </label>
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={4}
            placeholder="Tell us about your study goals, scholarship interest, or questions (min 10 characters)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full rounded-md bg-[#0D3B2E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#092A20] disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Submitting Inquiry...' : 'Submit Admissions Inquiry'}
        </button>
      </form>
    </div>
  );
}

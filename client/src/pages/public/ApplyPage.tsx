import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  INQUIRY_CATEGORIES,
  INTAKE_SEMESTERS,
  type InquiryCategoryType,
  type IntakeSemesterType,
} from '@zero-compile/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

const STEPS = [
  { id: 1, title: 'Student Details' },
  { id: 2, title: 'Academic Profile' },
  { id: 3, title: 'Study Preferences' },
  { id: 4, title: 'Statement & Submit' },
];

export default function ApplyPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
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

  function handleNextStep() {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        addToast('error', 'Please fill in First Name, Last Name, and Email.');
        return;
      }
    }
    if (step === 2) {
      if (!currentEducationLevel.trim()) {
        addToast('error', 'Please enter your current education level.');
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      addToast('error', 'Please enter a message of at least 10 characters.');
      return;
    }
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
          <title>Inquiry Submitted â€” StudySphere</title>
        </Helmet>
        <div className="space-y-5 rounded-xl bg-white p-8 text-center ring-1 ring-zinc-950/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Application Logged
            </div>
            <h1 className="font-display text-2xl font-bold text-zinc-950">Inquiry Received</h1>
            <p className="text-sm text-zinc-700">
              Save your unique reference code below to track your application status anytime:
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-lg bg-[#F8FAFC] px-4 py-3.5 ring-1 ring-zinc-950/10">
            <span className="font-mono text-xl font-bold text-teal-700">{submittedRef}</span>
            <Button type="button" variant="secondary" size="sm" onClick={copyReference}>
              {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to={`/track?ref=${encodeURIComponent(submittedRef)}&email=${encodeURIComponent(email)}`}>
              <Button className="bg-teal-600 text-white hover:bg-teal-700">
                Track Application <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSubmittedRef(null);
                setMessage('');
                setStep(1);
              }}
            >
              Submit Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Book Free Consultation â€” StudySphere</title>
      </Helmet>

      <div className="space-y-1 border-b border-zinc-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Online Admissions
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          Book Free Consultation
        </h1>
        <p className="text-sm text-zinc-700">
          Complete your profile in 4 quick steps. You will receive a{' '}
          <code className="font-semibold text-teal-700">ZRC-YYYY-XXX</code> tracking code immediately.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s) => {
          const isCurrent = step === s.id;
          const isCompleted = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-teal-600 text-white'
                  : isCompleted
                    ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 cursor-pointer'
                    : 'bg-white text-zinc-600 ring-1 ring-zinc-950/10'
              }`}
            >
              <span className="font-mono text-[11px]">0{s.id}</span>
              <span className="truncate">{s.title}</span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-teal-700">
                01. Student Details
              </h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Input
                  type="text"
                  required
                  placeholder="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  type="text"
                  required
                  placeholder="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <Input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Phone / WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-teal-700">
                02. Academic Background
              </h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Input
                  type="text"
                  required
                  placeholder="Current Education Level (e.g. Bachelor's, HSC) *"
                  value={currentEducationLevel}
                  onChange={(e) => setCurrentEducationLevel(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Field of Study"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="GPA / Percentage"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="English Proficiency (e.g. IELTS 7.0)"
                  value={englishProficiency}
                  onChange={(e) => setEnglishProficiency(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-teal-700">
                03. Study Preferences
              </h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Select
                  value={preferredCountry}
                  onChange={(e) => {
                    setPreferredCountry(e.target.value);
                    setPreferredUniversity('');
                  }}
                >
                  <option value="">Preferred Destination (Optional)</option>
                  {countriesRes?.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={preferredUniversity}
                  onChange={(e) => setPreferredUniversity(e.target.value)}
                >
                  <option value="">Preferred University (Optional)</option>
                  {universitiesRes?.data.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>

                <Input
                  type="text"
                  placeholder="Intended Program (e.g. MSc Data Science)"
                  value={intendedProgram}
                  onChange={(e) => setIntendedProgram(e.target.value)}
                />

                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InquiryCategoryType)}
                >
                  {INQUIRY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>

                <Select value={intakeSemester} onChange={(e) => setIntakeSemester(e.target.value)}>
                  <option value="">Intake Semester (Optional)</option>
                  {INTAKE_SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </Select>

                <Input
                  type="number"
                  min={2020}
                  max={2050}
                  placeholder="Intake Year (e.g. 2026)"
                  value={intakeYear}
                  onChange={(e) => setIntakeYear(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-teal-700">
                04. Statement & Inquiry Message
              </h2>
              <Textarea
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                placeholder="Tell us about your study goals, scholarship interest, or questions (min 10 characters)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="rounded-lg bg-[#F8FAFC] p-3.5 text-xs text-zinc-700 ring-1 ring-zinc-950/10">
                Submitting for <strong className="text-zinc-950">{firstName} {lastName}</strong> ({email}) â€¢{' '}
                {currentEducationLevel}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {submitMutation.isPending ? 'Submitting Inquiry...' : 'Submit Admissions Inquiry'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

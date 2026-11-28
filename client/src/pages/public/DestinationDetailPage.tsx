import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coins,
  GraduationCap,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { prefetchCountriesList, prefetchUniversity } from '../../lib/prefetch';

interface CountryUniversity {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
}

interface CountryDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  highlights: string[];
  intakes: string[];
  educationSystem: string | null;
  admissionRequirements: string | null;
  tuitionAndLivingCosts: string | null;
  visaRequirements: string | null;
  scholarshipInfo: string | null;
  universities: CountryUniversity[];
}

export default function DestinationDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-country', slug],
    queryFn: () => apiRequest<CountryDetail>(`/countries/${slug}`),
    enabled: Boolean(slug),
  });

  // Quick Inquiry Card state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [educationLevel, setEducationLevel] = useState("Bachelor's");
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const quickInquiryMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiRequest<{ referenceNumber: string }>('/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      setSubmittedRef(res.data.referenceNumber);
      addToast('success', `Inquiry submitted: ${res.data.referenceNumber}`);
    },
    onError: (err) =>
      addToast('error', err instanceof Error ? err.message : 'Could not submit inquiry.'),
  });

  if (isLoading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="h-[380px] w-full animate-pulse bg-zinc-200/80 sm:h-[440px]" />
        <div className="mx-auto w-11/12 max-w-[1440px] space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-950/10" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-950/10" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-4 px-4 py-20 text-center">
        <p className="text-base font-semibold text-zinc-950">Destination not found.</p>
        <Link to="/countries" className="text-sm font-semibold text-teal-600 hover:underline">
          Back to Destinations
        </Link>
      </div>
    );
  }

  const c = data.data;
  const coverImage = c.imageUrl || '/hero-landmarks.jpg';

  function handleQuickSubmit(e: FormEvent) {
    e.preventDefault();
    quickInquiryMutation.mutate({
      student: {
        firstName,
        lastName,
        email,
        phone: phone.trim() || null,
        nationality: 'Bangladeshi',
      },
      academic: {
        currentEducationLevel: educationLevel,
      },
      preferredCountry: c.id,
      category: 'application',
      message:
        message.trim().length >= 10
          ? message.trim()
          : `Interested in studying in ${c.name}. Please evaluate my profile.`,
    });
  }

  const keyFacts = [
    {
      label: 'Tuition Fee Range',
      value: c.tuitionAndLivingCosts ? 'See Cost Guide Below' : 'Varies by University',
      icon: Coins,
    },
    {
      label: 'Living Cost Estimate',
      value: 'Country-Specific Budget',
      icon: Wallet,
    },
    {
      label: 'Intake Seasons',
      value: c.intakes.length > 0 ? c.intakes.slice(0, 3).join(' • ') : 'Fall • Spring • Summer',
      icon: Calendar,
    },
    {
      label: 'Post-Study Work Visa',
      value: c.visaRequirements ? 'Eligible Pathways' : 'Post-Study Options',
      icon: ShieldCheck,
    },
  ];

  const requirementChecklist = [
    c.admissionRequirements ||
      'Verified academic transcripts, certificates, and minimum GPA/CGPA per university tier.',
    'English proficiency proof (IELTS, PTE Academic, TOEFL iBT, or MOI where accepted).',
    'Valid passport, Statement of Purpose (SOP), and 2 Letters of Recommendation (LORs).',
    c.visaRequirements ||
      'Financial solvency documentation, sponsor income proof, and embassy interview readiness.',
  ];

  return (
    <div className="bg-[#F8FAFC] pb-20">
      <Helmet>
        <title>Study in {c.name} — StudySphere</title>
        <meta name="description" content={c.description.slice(0, 155)} />
      </Helmet>

      {/* Full-Bleed Country Cover Hero */}
      <section className="relative flex min-h-[380px] w-full items-end overflow-hidden bg-zinc-950 sm:min-h-[440px]">
        <img
          src={coverImage}
          alt={`Study in ${c.name}`}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 mx-auto w-11/12 max-w-[1440px] pb-10 pt-28"
        >
          <div className="mb-3 flex items-center gap-1.5 text-sm text-white/80">
            <Link
              to="/countries"
              onMouseEnter={() => void prefetchCountriesList(queryClient)}
              className="transition-colors hover:text-teal-300"
            >
              Destinations
            </Link>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <span className="font-medium text-white">{c.name}</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Study in {c.name}
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg line-clamp-2">
            {c.description}
          </p>

          <Link
            to={`/apply?country=${c.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            <span>Apply for {c.name}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {/* 1. Quick Key Facts Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keyFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="flex items-start gap-3.5 rounded-2xl bg-white p-5 ring-1 ring-zinc-950/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    {fact.label}
                  </div>
                  <div className="mt-1 text-sm font-bold text-zinc-950">{fact.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. 2-Column Main Content + Sticky Consultation Card */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-10 lg:col-span-8">
            {/* Why Study in Country */}
            <section className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                Why Study in {c.name}
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
                {c.description}
              </p>

              {c.educationSystem && (
                <div className="space-y-2 border-t border-zinc-200 pt-5">
                  <h3 className="font-display text-lg font-bold text-zinc-950">
                    Education System
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                    {c.educationSystem}
                  </p>
                </div>
              )}

              {c.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-5">
                  {c.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-semibold text-zinc-950 ring-1 ring-zinc-950/10"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> {h}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Admission & Visa Requirements */}
            <section className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                Admission &amp; Visa Requirements
              </h2>

              <ul className="space-y-3.5">
                {requirementChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {c.tuitionAndLivingCosts && (
                <div className="space-y-2 border-t border-zinc-200 pt-5">
                  <h3 className="font-display text-base font-bold text-zinc-950">
                    Tuition &amp; Living Costs
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                    {c.tuitionAndLivingCosts}
                  </p>
                </div>
              )}

              {c.scholarshipInfo && (
                <div className="space-y-2 border-t border-zinc-200 pt-5">
                  <h3 className="font-display text-base font-bold text-zinc-950">
                    Scholarships &amp; Financial Aid
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                    {c.scholarshipInfo}
                  </p>
                </div>
              )}
            </section>

            {/* Top Partner Universities in Country */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-zinc-950">
                  <GraduationCap className="h-6 w-6 text-teal-600" />
                  Top Partner Universities in {c.name}
                </h2>
                <Link
                  to={`/universities?country=${c.slug}`}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All →
                </Link>
              </div>

              {c.universities.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
                  Partner university directory for {c.name} is being updated. Submit an inquiry on
                  the right for a personalized shortlist.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {c.universities.map((u) => (
                    <Link
                      key={u.id}
                      to={`/universities/${u.slug}`}
                      onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
                      onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
                      onFocus={() => void prefetchUniversity(queryClient, u.slug)}
                      className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
                    >
                      {u.logoUrl ? (
                        <img
                          src={u.logoUrl}
                          alt={u.name}
                          loading="lazy"
                          className="h-11 w-11 shrink-0 rounded-xl bg-zinc-50 object-contain p-1 ring-1 ring-zinc-200/70"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                          <Building2 className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-sm font-bold text-zinc-950 group-hover:text-teal-700">
                          {u.name}
                        </div>
                        <div className="text-xs text-zinc-600">{u.city || c.name}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Sticky Quick-Inquiry Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/10">
              <div className="space-y-1 border-b border-zinc-200 pb-4">
                <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
                  {c.name} Admissions
                </span>
                <h3 className="font-display text-lg font-bold text-zinc-950">
                  Free Profile Evaluation
                </h3>
                <p className="text-xs text-zinc-600">
                  Get a personalized shortlist &amp; scholarship check for {c.name}.
                </p>
              </div>

              {submittedRef ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-zinc-950">Inquiry Received!</div>
                    <div className="font-mono text-base font-bold text-teal-700">{submittedRef}</div>
                  </div>
                  <Link
                    to={`/track?ref=${encodeURIComponent(submittedRef)}&email=${encodeURIComponent(email)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Track Application <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input
                      required
                      placeholder="First Name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      required
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <Input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Phone / WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Current Education (e.g. HSC / BSc) *"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  />
                  <Textarea
                    rows={3}
                    placeholder={`Questions about studying in ${c.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={quickInquiryMutation.isPending}
                    className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                  >
                    {quickInquiryMutation.isPending
                      ? 'Submitting...'
                      : `Apply for ${c.name} →`}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

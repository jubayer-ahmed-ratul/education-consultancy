import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coins,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { prefetchDestination, prefetchUniversitiesList } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

interface UniversityDetail {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  city: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  description: string;
  programs: string[];
  admissionRequirements: string | null;
  englishRequirements: string | null;
  scholarshipDetails: string | null;
  applicationDeadlines: string | null;
  website: string | null;
  tuitionRange: { min: number; max: number; currency: string } | null;
  country: { id: string; name: string; slug: string };
}

function findCachedUniversity(
  queryClient: QueryClient,
  slug: string,
): { success: true; data: UniversityDetail } | undefined {
  if (!slug) return undefined;

  const listQueries = queryClient.getQueriesData<{
    data?: Array<Partial<UniversityDetail>>;
  }>({ queryKey: queryKeys.universities.all });

  for (const [, cached] of listQueries) {
    const match = cached?.data?.find((u) => u.slug === slug);
    if (match && match.name && match.country) {
      return {
        success: true,
        data: {
          id: match.id ?? slug,
          name: match.name,
          slug: match.slug ?? slug,
          countryId: match.countryId ?? match.country.id ?? '',
          city: match.city ?? null,
          logoUrl: match.logoUrl ?? null,
          imageUrl: match.imageUrl ?? null,
          description: match.description ?? '',
          programs: match.programs ?? [],
          admissionRequirements: match.admissionRequirements ?? null,
          englishRequirements: match.englishRequirements ?? null,
          scholarshipDetails: match.scholarshipDetails ?? null,
          applicationDeadlines: match.applicationDeadlines ?? null,
          website: match.website ?? null,
          tuitionRange: match.tuitionRange ?? null,
          country: match.country,
        },
      };
    }
  }

  const countryQueries = queryClient.getQueriesData<{
    data?: {
      id?: string;
      name?: string;
      slug?: string;
      universities?: Array<Partial<UniversityDetail>>;
    };
  }>({ queryKey: ['public-country'] });

  for (const [, cached] of countryQueries) {
    const countryData = cached?.data;
    const match = countryData?.universities?.find((u) => u.slug === slug);
    if (match && match.name && countryData?.name && countryData?.slug) {
      return {
        success: true,
        data: {
          id: match.id ?? slug,
          name: match.name,
          slug: match.slug ?? slug,
          countryId: match.countryId ?? countryData.id ?? '',
          city: match.city ?? null,
          logoUrl: match.logoUrl ?? null,
          imageUrl: match.imageUrl ?? null,
          description: match.description ?? '',
          programs: match.programs ?? [],
          admissionRequirements: match.admissionRequirements ?? null,
          englishRequirements: match.englishRequirements ?? null,
          scholarshipDetails: match.scholarshipDetails ?? null,
          applicationDeadlines: match.applicationDeadlines ?? null,
          website: match.website ?? null,
          tuitionRange: match.tuitionRange ?? null,
          country: {
            id: countryData.id ?? '',
            name: countryData.name,
            slug: countryData.slug,
          },
        },
      };
    }
  }

  return undefined;
}

export default function UniversityDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setLogoFailed(false);
  }, [slug]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-university', slug],
    queryFn: () => apiRequest<UniversityDetail>(`/universities/${slug}`),
    placeholderData: () => findCachedUniversity(queryClient, slug),
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
        <div className="h-[360px] w-full animate-pulse bg-zinc-200/80 sm:h-[420px]" />
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-20 text-center">
        <p className="text-base font-semibold text-zinc-950">University not found.</p>
        <Link to="/universities" className="text-sm font-semibold text-teal-600 hover:underline">
          Back to Universities
        </Link>
      </div>
    );
  }

  const u = data.data;
  const initials = u.name
    .split(/\s+/)
    .filter((w) => !['of', 'and', 'the', 'for'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

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
      preferredCountry: u.countryId,
      preferredUniversity: u.id,
      category: 'application',
      message:
        message.trim().length >= 10
          ? message.trim()
          : `Interested in applying to ${u.name} (${u.country.name}).`,
    });
  }

  const keyFacts = [
    {
      label: 'Campus Location',
      value: [u.city, u.country.name].filter(Boolean).join(', '),
      icon: MapPin,
    },
    {
      label: 'Tuition Fee Range',
      value: u.tuitionRange
        ? `${u.tuitionRange.currency} ${u.tuitionRange.min.toLocaleString()} – ${u.tuitionRange.max.toLocaleString()} / yr`
        : 'Contact for Fee Schedule',
      icon: Coins,
    },
    {
      label: 'Major Intakes',
      value: u.applicationDeadlines || 'Fall • Spring • Rolling',
      icon: Calendar,
    },
    {
      label: 'Scholarships',
      value: u.scholarshipDetails ? 'Merit Bursaries Available' : 'Merit Aid Eligible',
      icon: Award,
    },
  ];

  const entryChecklist = [
    u.admissionRequirements ||
      'Completed secondary or undergraduate degree with competitive academic GPA.',
    u.englishRequirements ||
      'IELTS 6.0–7.0 overall (or equivalent TOEFL / PTE score; MOI accepted where applicable).',
    'Verified transcripts, Statement of Purpose (SOP), passport copy, and reference letters.',
  ];

  return (
    <div className="bg-[#F8FAFC] pb-20">
      <Helmet>
        <title>{u.name} — StudySphere</title>
        <meta name="description" content={u.description.slice(0, 155)} />
      </Helmet>

      {/* Navy-to-Teal Hero Section */}
      <section className="relative flex min-h-[360px] w-full items-end overflow-hidden bg-gradient-to-br from-[#09090B] via-[#0B1F3A] to-[#0D9488] sm:min-h-[420px]">
        {u.imageUrl && (
          <img
            src={u.imageUrl}
            alt={u.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div
          className={`absolute inset-0 ${
            u.imageUrl
              ? 'bg-gradient-to-t from-[#09090B]/95 via-[#0B1F3A]/80 to-[#0D9488]/65'
              : 'opacity-20'
          }`}
          style={
            !u.imageUrl
              ? {
                  backgroundImage:
                    'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.28) 0%, transparent 45%)',
                }
              : undefined
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 lg:px-8"
        >
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-white/80">
            <Link
              to="/universities"
              onMouseEnter={() => void prefetchUniversitiesList(queryClient)}
              className="transition-colors hover:text-teal-300"
            >
              Universities
            </Link>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <Link
              to={`/countries/${u.country.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, u.country.slug)}
              className="transition-colors hover:text-teal-300"
            >
              {u.country.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <span className="font-medium text-white">{u.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {u.logoUrl && !logoFailed ? (
              <img
                src={u.logoUrl}
                alt={`${u.name} logo`}
                onError={() => setLogoFailed(true)}
                className="h-16 w-16 shrink-0 rounded-2xl bg-white object-contain p-2 shadow-lg"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white font-display text-xl font-extrabold text-zinc-950 shadow-lg">
                {initials || <Building2 className="h-7 w-7 text-teal-600" />}
              </span>
            )}

            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-teal-600 px-3 py-0.5 text-xs font-semibold text-white">
                {[u.city, u.country.name].filter(Boolean).join(', ')}
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {u.name}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/apply?country=${u.countryId}&university=${u.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              <span>Apply to {u.name}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {u.website && (
              <a
                href={u.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                Official Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </motion.div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-Column Key Facts Bar */}
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
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    {fact.label}
                  </div>
                  <div className="mt-1 text-sm font-bold text-zinc-950">{fact.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Content + Sticky Inquiry Card */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                About {u.name}
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
                {u.description}
              </p>
            </section>

            {u.programs.length > 0 && (
              <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
                <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                  Popular Programs &amp; Faculties
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {u.programs.map((p) => (
                    <span
                      key={p}
                      className="rounded-xl bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-zinc-950 ring-1 ring-zinc-950/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                Entry &amp; English Requirements
              </h2>
              <ul className="space-y-3.5">
                {entryChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {u.scholarshipDetails && (
              <section className="space-y-3 rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-zinc-950">
                  <Award className="h-5 w-5 text-teal-600" /> Scholarships &amp; Financial Aid
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                  {u.scholarshipDetails}
                </p>
              </section>
            )}
          </div>

          {/* Right Sticky Quick-Inquiry Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/10">
              <div className="space-y-1 border-b border-zinc-200 pb-4">
                <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
                  Direct Application
                </span>
                <h3 className="font-display text-lg font-bold text-zinc-950">
                  Apply to {u.name}
                </h3>
                <p className="text-xs text-zinc-600">
                  Pre-selected for {u.country.name}. Get an offer &amp; scholarship assessment.
                </p>
              </div>

              {submittedRef ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-zinc-950">Application Logged!</div>
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
                    placeholder={`Intended program at ${u.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={quickInquiryMutation.isPending}
                    className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                  >
                    {quickInquiryMutation.isPending ? 'Submitting...' : `Apply to ${u.name} →`}
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

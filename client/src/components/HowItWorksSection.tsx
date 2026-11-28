import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StepItem {
  num: number;
  title: string;
  description: string;
  leftPct: number;
  topPct: number;
  placement: 'above' | 'below';
}

const STEPS: StepItem[] = [
  {
    num: 1,
    title: 'Free Profile Evaluation',
    description: 'Assess academic background, budget, and career goals.',
    leftPct: 7.5,
    topPct: 80.95,
    placement: 'above',
  },
  {
    num: 2,
    title: 'Country & University Match',
    description: 'Shortlist top-fit programs and scholarship opportunities.',
    leftPct: 22.82,
    topPct: 73.36,
    placement: 'below',
  },
  {
    num: 3,
    title: 'Document & SOP Preparation',
    description: 'Craft strong SOPs, LORs, and verified application files.',
    leftPct: 40.66,
    topPct: 58.23,
    placement: 'above',
  },
  {
    num: 4,
    title: 'University Application & Offer',
    description: 'Submit direct applications and receive Offer Letters.',
    leftPct: 59.34,
    topPct: 40.58,
    placement: 'below',
  },
  {
    num: 5,
    title: 'Visa Filing & Mock Interview',
    description: 'Complete financial audit, embassy filing, and interview prep.',
    leftPct: 77.18,
    topPct: 25.45,
    placement: 'above',
  },
  {
    num: 6,
    title: 'Pre-Departure & Fly',
    description: 'Final travel briefing, housing setup, and airport support.',
    leftPct: 92.5,
    topPct: 17.86,
    placement: 'below',
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-y border-zinc-200 bg-white py-16 sm:py-20">
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-12 px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
              6 Simple Steps
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              How It Works
            </h2>
            <p className="text-sm text-zinc-700">
              Your structured, transparent journey from free profile evaluation to campus arrival.
            </p>
          </div>
        </div>

        {/* Desktop Ascending Curved Path (lg+) */}
        <div className="relative mx-auto hidden h-[460px] max-w-6xl lg:block">
          <svg
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {/* Subtle base guide */}
            <path
              d="M 90 340 C 360 325, 840 90, 1110 75"
              fill="none"
              stroke="#E4E4E7"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {/* Animated Teal curve */}
            <motion.path
              d="M 90 340 C 360 325, 840 90, 1110 75"
              fill="none"
              stroke="#0D9488"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 18, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, ease: 'easeOut', delay: idx * 0.32 }}
              style={{ left: `${step.leftPct}%`, top: `${step.topPct}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {/* Circular Node */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 font-display text-lg font-bold text-white shadow-lg ring-4 ring-white">
                {step.num}
              </div>

              {/* Compact Text Card positioned cleanly above or below */}
              <div
                className={`absolute left-1/2 w-52 -translate-x-1/2 rounded-xl bg-white/95 p-3.5 text-center shadow-sm ring-1 ring-zinc-950/10 backdrop-blur-xs ${
                  step.placement === 'above' ? 'bottom-[calc(100%+14px)]' : 'top-[calc(100%+14px)]'
                }`}
              >
                <div className="font-display text-sm font-bold leading-snug text-zinc-950">
                  {step.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-700">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile & Tablet Vertical Ascending Timeline */}
        <div className="relative space-y-6 pl-4 lg:hidden">
          <div className="absolute bottom-6 left-[35px] top-6 w-0.5 bg-teal-600/30" />
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.2 }}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 font-display text-sm font-bold text-white shadow-md ring-4 ring-white">
                {step.num}
              </div>
              <div className="flex-1 rounded-xl bg-[#F8FAFC] p-4 ring-1 ring-zinc-950/10">
                <div className="font-display text-sm font-bold text-zinc-950">{step.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-700">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center pt-2">
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-teal-700"
          >
            <span>Start Step 1: Book Free Counseling</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

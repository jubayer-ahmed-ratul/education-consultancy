import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpenCheck,
  Compass,
  FileEdit,
  GraduationCap,
  MessageSquare,
  PlaneTakeoff,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    title: 'Career & Course Counseling',
    description:
      'Personalized major and country selection based on your academic profile, goals, and budget.',
    icon: Compass,
  },
  {
    title: 'University Selection & Admission',
    description:
      'Direct application processing to top-ranked global universities with priority offer tracking.',
    icon: GraduationCap,
  },
  {
    title: 'Scholarship & Financial Aid Guidance',
    description:
      'Merit-based scholarship matching, bursary nominations, and tuition fee waiver support.',
    icon: BadgeDollarSign,
  },
  {
    title: 'SOP, LOR & Essay Review',
    description:
      'Structured editing and advisor feedback for compelling Statements of Purpose and resumes.',
    icon: FileEdit,
  },
  {
    title: 'IELTS / TOEFL / PTE Prep Guidance',
    description:
      'Test strategy, score target planning, and English waiver eligibility checks per university.',
    icon: BookOpenCheck,
  },
  {
    title: 'Student Visa Processing',
    description:
      'End-to-end documentation audit, financial solvency review, and compliant visa filing.',
    icon: ShieldCheck,
  },
  {
    title: 'Mock Visa Interview Coaching',
    description:
      'One-on-one embassy interview preparation sessions to build confidence and clarity.',
    icon: MessageSquare,
  },
  {
    title: 'Pre-Departure & Accommodation Support',
    description:
      'Airport pickup coordination, student housing guidance, and pre-departure orientation.',
    icon: PlaneTakeoff,
  },
];

export function ServicesSection() {
  return (
    <section className="overflow-x-clip bg-[#F8FAFC] py-4">
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              End-to-End Advisory
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Our Study Abroad Services
            </h2>
          </div>
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
          >
            Book Free Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            const isLeft = index % 4 < 2;

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: isLeft ? -42 : 42 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  ease: 'easeOut',
                  delay: (index % 4) * 0.08,
                }}
                className="group flex flex-col justify-between rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 transition-all duration-300 hover:-translate-y-1 hover:ring-teal-600/40"
              >
                <div className="space-y-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-bold leading-snug text-zinc-950">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700">{service.description}</p>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-4">
                  <Link
                    to="/apply"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 transition-colors hover:text-teal-700"
                  >
                    Learn More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

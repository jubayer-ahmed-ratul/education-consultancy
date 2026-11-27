import { useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    question: 'How does StudySphere evaluate my academic profile and eligibility?',
    answer:
      'During your free initial consultation, our senior counselors review your SSC/HSC or Bachelor’s CGPA, IELTS/TOEFL/PTE scores, study gap (if any), and financial budget to match you with accredited universities where you have the highest admission and visa probability.',
  },
  {
    question: 'Which study destinations and degree levels do you support?',
    answer:
      'We assist Bangladeshi students applying for Foundation, Bachelor’s, Master’s, MBA, and PhD programs across the United Kingdom, Canada, Australia, the United States, Germany, and Malaysia.',
  },
  {
    question: 'Do you help with merit scholarships and tuition fee waivers?',
    answer:
      'Yes. We identify automatic regional bursaries, Vice-Chancellor merit scholarships, and partial tuition waivers (often 15%–50%+) and help you tailor your scholarship essays and deadlines to maximize financial aid.',
  },
  {
    question: 'What documents are required for an overseas university application?',
    answer:
      'Typically you will need academic transcripts and certificates, passport copy, English proficiency test score (IELTS/PTE/TOEFL or MOI where accepted), Statement of Purpose (SOP), 2 Letters of Recommendation (LORs), and an updated CV. Our team reviews and formats every document before submission.',
  },
  {
    question: 'How do you prepare students for student visa filing and embassy interviews?',
    answer:
      'Our compliance team audits your bank solvency, sponsor income documents, and affidavit/GTE/SOP requirements, followed by one-on-one mock visa interview coaching tailored to UKVI, Canadian study permit, Australian Subclass 500, or US F-1 standards.',
  },
  {
    question: 'Does StudySphere charge any hidden consultation fees?',
    answer:
      'Initial profile evaluation, university shortlisting, and direct partner-university applications are 100% transparent with zero hidden fees. Any applicable third-party embassy or SEVIS/IHS fees are paid directly by the student.',
  },
  {
    question: 'When should I start my application for the upcoming intake?',
    answer:
      'We recommend starting 5 to 8 months before your target intake (September/Fall, January/Spring, or May/Summer) so there is ample time for offer letters, scholarship decisions, financial preparation, and visa stamping.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-11/12 space-y-8 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
          <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Everything You Need to Know
        </h2>
        <p className="text-sm text-zinc-700">
          Clear answers on admissions, scholarships, documentation, and student visa processing.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              className={`rounded-2xl bg-white transition-all ${
                isOpen
                  ? 'ring-2 ring-teal-600/40 shadow-xs'
                  : 'ring-1 ring-zinc-950/10 hover:ring-zinc-950/20'
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
              >
                <span className="font-display text-sm font-bold text-zinc-950 sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-teal-600' : 'text-zinc-500'
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-zinc-100 px-6 pb-5 pt-3 text-sm leading-relaxed text-zinc-700">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          to="/apply"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          Still have questions? Book a Free Consultation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

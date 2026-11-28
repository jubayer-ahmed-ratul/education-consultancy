import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { prefetchUniversitiesList, prefetchUniversity } from '../lib/prefetch';

export interface MarqueeUniversity {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

function UniversityPill({ uni }: { uni: MarqueeUniversity }) {
  const queryClient = useQueryClient();
  const [imgFailed, setImgFailed] = useState(false);

  const initials = uni.name
    .split(/\s+/)
    .filter((w) => !['of', 'and', 'the', 'for'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Link
      to={`/universities/${uni.slug}`}
      onMouseEnter={() => void prefetchUniversity(queryClient, uni.slug)}
      onTouchStart={() => void prefetchUniversity(queryClient, uni.slug)}
      onFocus={() => void prefetchUniversity(queryClient, uni.slug)}
      className="flex shrink-0 items-center gap-3.5 rounded-2xl bg-white px-5 py-3.5 ring-1 ring-zinc-950/10 transition-all hover:shadow-md hover:ring-teal-600/50"
    >
      {uni.logoUrl && !imgFailed ? (
        <img
          src={uni.logoUrl}
          alt={`${uni.name} logo`}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-9 w-9 shrink-0 rounded-lg object-contain bg-zinc-50 p-1 ring-1 ring-zinc-200/70"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-xs font-bold text-teal-700">
          {initials || 'U'}
        </span>
      )}
      <span className="whitespace-nowrap text-sm font-semibold text-zinc-950 sm:text-base">
        {uni.name}
      </span>
    </Link>
  );
}

export function UniversitiesMarqueeSection({
  universities,
}: {
  universities: MarqueeUniversity[];
}) {
  const queryClient = useQueryClient();

  if (!universities.length) return null;

  const midpoint = Math.ceil(universities.length / 2);
  const topRow = universities.slice(0, midpoint);
  const bottomRow = universities.slice(midpoint).length > 0 ? universities.slice(midpoint) : topRow;

  return (
    <section className="mx-auto w-11/12 max-w-[1440px] space-y-8 px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <GraduationCap className="h-3.5 w-3.5" /> Accredited Institutions
          </div>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Partner Universities
          </h2>
        </div>
        <Link
          to="/universities"
          onMouseEnter={() => void prefetchUniversitiesList(queryClient)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          Explore All Universities <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Dual-Row Infinite Marquee with Edge Fade Mask */}
      <div className="space-y-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        {/* Top Row: Left to Right */}
        <div className="group flex overflow-hidden py-1">
          <div className="animate-marquee-right flex w-max gap-4 group-hover:[animation-play-state:paused]">
            {[...topRow, ...topRow].map((uni, i) => (
              <UniversityPill key={`top-${uni.id}-${i}`} uni={uni} />
            ))}
          </div>
        </div>

        {/* Bottom Row: Right to Left */}
        <div className="group flex overflow-hidden py-1">
          <div className="animate-marquee-left flex w-max gap-4 group-hover:[animation-play-state:paused]">
            {[...bottomRow, ...bottomRow].map((uni, i) => (
              <UniversityPill key={`bot-${uni.id}-${i}`} uni={uni} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

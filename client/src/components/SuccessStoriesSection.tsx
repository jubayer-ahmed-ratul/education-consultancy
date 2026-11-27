import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicBundleData } from '../hooks/usePublicBundle';

type StoryItem = PublicBundleData['successStories'][number];

const FALLBACK_IMAGES = [
  '/story-1.jpg',
  '/story-2.jpg',
  '/story-3.jpg',
  '/story-4.jpg',
  '/about-primary.jpg',
  '/about-campus.jpg',
];

function getCircularOffset(index: number, activeIndex: number, total: number): number {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

export function SuccessStoriesSection({ stories }: { stories: StoryItem[] }) {
  const items = stories.slice(0, 6);
  const total = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(timer);
  }, [total, paused]);

  if (!total) return null;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);

  function getPositionClasses(offset: number): string {
    if (offset === 0) {
      return 'translate-x-0 scale-100 opacity-100 z-30 shadow-2xl ring-2 ring-teal-500/40';
    }
    if (offset === -1) {
      return '-translate-x-[68%] scale-[0.86] opacity-85 z-20 cursor-pointer hover:opacity-95 ring-1 ring-zinc-950/10 shadow-lg';
    }
    if (offset === 1) {
      return 'translate-x-[68%] scale-[0.86] opacity-85 z-20 cursor-pointer hover:opacity-95 ring-1 ring-zinc-950/10 shadow-lg';
    }
    if (offset === -2) {
      return 'hidden sm:block -translate-x-[122%] scale-[0.74] opacity-55 z-10 cursor-pointer hover:opacity-75 ring-1 ring-zinc-950/10 shadow-md';
    }
    if (offset === 2) {
      return 'hidden sm:block translate-x-[122%] scale-[0.74] opacity-55 z-10 cursor-pointer hover:opacity-75 ring-1 ring-zinc-950/10 shadow-md';
    }
    return 'translate-x-0 scale-50 opacity-0 pointer-events-none z-0';
  }

  return (
    <section className="mx-auto max-w-11/12 space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Award className="h-3.5 w-3.5" /> Alumni Outcomes
          </div>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Success Stories
          </h2>
        </div>

        <Link
          to="/success-stories"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          View All Stories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Layered Overlapping Coverflow Stage */}
      <div
        className="relative overflow-hidden py-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true);
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX ?? null;
          if (touchStartX.current !== null && endX !== null) {
            const diff = touchStartX.current - endX;
            if (diff > 40) goNext();
            else if (diff < -40) goPrev();
          }
          touchStartX.current = null;
          setPaused(false);
        }}
      >
        {/* Left/Right Navigation Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous success story"
              className="absolute left-2 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md ring-1 ring-zinc-950/10 transition-colors hover:bg-teal-600 hover:text-white cursor-pointer sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next success story"
              className="absolute right-2 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md ring-1 ring-zinc-950/10 transition-colors hover:bg-teal-600 hover:text-white cursor-pointer sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Overlapping Coverflow Cards */}
        <div className="relative flex h-[390px] w-full items-center justify-center sm:h-[440px] md:h-[480px]">
          {items.map((story, idx) => {
            const offset = getCircularOffset(idx, activeIndex, total);
            const imgSrc = story.studentImage || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

            return (
              <div
                key={story.id}
                onClick={() => {
                  if (offset !== 0) setActiveIndex(idx);
                }}
                className={`absolute aspect-[3/4] w-[270px] overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-500 ease-out sm:w-[310px] md:w-[340px] ${getPositionClasses(
                  offset
                )}`}
              >
                <img
                  src={imgSrc}
                  alt={story.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />

                {/* Top-Right Verified Pill */}
                <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-zinc-900/75 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                  Verified
                </span>

                {/* Bottom Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-white sm:text-xl">
                    {story.name}
                  </h3>
                  <div className="text-xs font-medium text-teal-300 sm:text-sm">
                    {story.university} • {story.country}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/85 sm:text-xs">
                    {story.program}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pill Indicators */}
        {total > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {items.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`View story ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex ? 'w-6 bg-teal-600' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

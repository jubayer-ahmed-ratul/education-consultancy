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

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);

  function renderCard(
    story: StoryItem | undefined,
    idx: number,
    position: 'left' | 'center' | 'right'
  ) {
    if (!story) return null;
    const isCenter = position === 'center';
    const imgSrc = story.studentImage || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    const badgeText = `${story.country}${story.achievement ? ` • ${story.achievement}` : ' • Visa Approved'}`;

    return (
      <div
        key={`${story.id}-${position}`}
        onClick={() => {
          if (position === 'left') goPrev();
          if (position === 'right') goNext();
        }}
        className={`relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-500 ${
          isCenter
            ? 'z-20 w-[280px] scale-100 opacity-100 shadow-xl ring-2 ring-teal-600/40 sm:w-[320px] md:w-[350px]'
            : 'z-10 hidden w-[240px] scale-90 cursor-pointer opacity-70 ring-1 ring-zinc-950/10 hover:opacity-90 sm:block md:w-[270px]'
        }`}
      >
        <img
          src={imgSrc}
          alt={story.name}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
          <span className="inline-block rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            {badgeText}
          </span>
          <h3 className="font-display text-xl font-bold tracking-tight text-white">
            {story.name}
          </h3>
          <p className="text-xs font-medium text-white/85">
            {story.program} — {story.university}
          </p>
          {isCenter && (
            <p className="pt-1 text-xs leading-relaxed text-white/80 line-clamp-2">
              “{story.testimonial}”
            </p>
          )}
        </div>
      </div>
    );
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

      {/* Center-Focus Peek Carousel */}
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
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md ring-1 ring-zinc-950/10 transition-colors hover:bg-teal-600 hover:text-white cursor-pointer sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next success story"
              className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md ring-1 ring-zinc-950/10 transition-colors hover:bg-teal-600 hover:text-white cursor-pointer sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* 3-Card Stage (Left Peek | Center Focus | Right Peek) */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {total > 2 && renderCard(items[prevIndex], prevIndex, 'left')}
          {renderCard(items[activeIndex], activeIndex, 'center')}
          {total > 1 && renderCard(items[nextIndex], nextIndex, 'right')}
        </div>

        {/* Bottom Pill Indicators */}
        {total > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
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

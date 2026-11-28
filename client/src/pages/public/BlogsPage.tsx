import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Input } from '../../components/ui/input';
import { apiRequest } from '../../lib/api-client';
import {
  DEFAULT_BLOG_IMAGE,
  resolveMediaUrl,
  type CmsImageField,
} from '../../lib/cms-image';
import { prefetchBlog } from '../../lib/prefetch';

export interface PublicBlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string | null;
  featuredImage?: CmsImageField;
  coverImage?: CmsImageField;
  imageUrl?: CmsImageField;
  image?: CmsImageField;
}

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const params = new URLSearchParams({ page: '1', limit: '30' });
  if (search.trim()) params.set('search', search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ['public-blogs', search],
    placeholderData: keepPreviousData,
    queryFn: () => apiRequest<PublicBlogItem[]>(`/blogs?${params.toString()}`),
  });

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-8 pt-28 pb-16">
      <Helmet>
        <title>Blogs &amp; Study Guides — StudySphere</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <BookOpen className="h-3.5 w-3.5" /> Editorial Desk
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Blogs &amp; Study Guides
          </h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="pl-9 text-zinc-950"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
          No articles matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((b) => {
            const coverUrl = resolveMediaUrl(b, DEFAULT_BLOG_IMAGE);
            return (
              <Link
                key={b.id}
                to={`/blogs/${b.slug}`}
                onMouseEnter={() => void prefetchBlog(queryClient, b.slug)}
                onTouchStart={() => void prefetchBlog(queryClient, b.slug)}
                onFocus={() => void prefetchBlog(queryClient, b.slug)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-950/10 transition-all hover:shadow-md hover:ring-teal-600/40"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                    <img
                      src={coverUrl}
                      alt={b.title}
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_BLOG_IMAGE) {
                          e.currentTarget.src = DEFAULT_BLOG_IMAGE;
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                      {b.category}
                    </div>
                    <h2 className="font-display text-lg font-bold text-zinc-950 group-hover:text-teal-700">
                      {b.title}
                    </h2>
                    <p className="line-clamp-3 text-sm text-zinc-700">{b.excerpt}</p>
                  </div>
                </div>
                <div className="border-t border-zinc-100 px-5 py-3 text-xs font-medium text-zinc-600">
                  {b.author}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

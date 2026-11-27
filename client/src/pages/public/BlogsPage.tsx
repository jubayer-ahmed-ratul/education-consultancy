import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchBlog } from '../../lib/prefetch';

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const params = new URLSearchParams({ page: '1', limit: '30' });
  if (search.trim()) params.set('search', search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ['public-blogs', search],
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          category: string;
          author: string;
          publishedAt: string | null;
        }>
      >(`/blogs?${params.toString()}`),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Blogs & Study Guides — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E2DC] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Editorial Desk</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#111827]">Blogs & Study Guides</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-md border border-[#CFCAC0] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0D3B2E] focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg border border-[#E5E2DC] bg-[#F3F1EC]" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-10 text-center text-sm text-[#6B7280]">
          No articles matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((b) => (
            <Link
              key={b.id}
              to={`/blogs/${b.slug}`}
              onMouseEnter={() => void prefetchBlog(queryClient, b.slug)}
              onFocus={() => void prefetchBlog(queryClient, b.slug)}
              className="group flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-white p-5 transition-all hover:border-[#CFCAC0] hover:shadow-sm space-y-3"
            >
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D97706]">{b.category}</div>
                <h2 className="font-display text-lg font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                  {b.title}
                </h2>
                <p className="text-sm text-[#4B5563] line-clamp-3">{b.excerpt}</p>
              </div>
              <div className="border-t border-[#E5E2DC] pt-3 text-xs text-[#6B7280]">{b.author}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';

interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-blog', slug],
    queryFn: () => apiRequest<BlogDetail>(`/blogs/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-11/12 space-y-4 px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-60 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-11/12 space-y-3 px-4 py-12 text-center">
        <p className="text-sm font-medium text-rose-700">Article not found.</p>
        <Link to="/blogs" className="text-sm font-semibold text-teal-700 underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  const b = data.data;
  return (
    <article className="mx-auto max-w-11/12 space-y-6 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{b.seoTitle || b.title} â€” StudySphere</title>
        <meta name="description" content={b.seoDescription || b.excerpt} />
      </Helmet>

      <Link
        to="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Blogs
      </Link>

      <div className="space-y-5 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          {b.category} â€¢ {b.author}
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-zinc-950">
          {b.title}
        </h1>
        <p className="text-base leading-relaxed text-zinc-700">{b.excerpt}</p>
        <div className="whitespace-pre-wrap border-t border-zinc-200 pt-6 text-sm leading-relaxed text-zinc-950">
          {b.content}
        </div>
      </div>
    </article>
  );
}

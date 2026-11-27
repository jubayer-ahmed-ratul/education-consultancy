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

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#6B7280]">Loading article...</div>;
  if (error || !data?.data) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-rose-700">Article not found.</div>;

  const b = data.data;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <Helmet>
        <title>{b.seoTitle || b.title} — Zero Compile</title>
        <meta name="description" content={b.seoDescription || b.excerpt} />
      </Helmet>

      <Link to="/blogs" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#111827]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Blogs
      </Link>

      <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-10 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">
          {b.category} • {b.author}
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-[#111827]">{b.title}</h1>
        <p className="text-base leading-relaxed text-[#4B5563]">{b.excerpt}</p>
        <div className="border-t border-[#E5E2DC] pt-6 whitespace-pre-wrap text-sm leading-relaxed text-[#111827]">
          {b.content}
        </div>
      </div>
    </article>
  );
}

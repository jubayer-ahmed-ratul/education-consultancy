import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import {
  DEFAULT_BLOG_IMAGE,
  resolveMediaUrl,
  type CmsImageField,
} from '../../lib/cms-image';
import type { PublicBlogItem } from './BlogsPage';

interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string | null;
  featuredImage?: CmsImageField;
  coverImage?: CmsImageField;
  imageUrl?: CmsImageField;
  image?: CmsImageField;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-blog', slug],
    queryFn: () => apiRequest<BlogDetail>(`/blogs/${slug}`),
    placeholderData: () => {
      if (!slug) return undefined;
      const lists = queryClient.getQueriesData<{ data?: PublicBlogItem[] }>({
        queryKey: ['public-blogs'],
      });
      for (const [, cached] of lists) {
        const match = cached?.data?.find((item) => item.slug === slug);
        if (match) {
          return {
            success: true as const,
            data: {
              ...match,
              content: '',
            },
          };
        }
      }
      return undefined;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-4 pt-28 pb-16">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-200/70" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-3 pt-28 pb-16 text-center">
        <p className="text-sm font-medium text-rose-700">Article not found.</p>
        <Link to="/blogs" className="text-sm font-semibold text-teal-700 underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  const b = data.data;
  const coverUrl = resolveMediaUrl(b, DEFAULT_BLOG_IMAGE);

  return (
    <article className="mx-auto w-11/12 max-w-[1440px] space-y-6 pt-28 pb-16">
      <Helmet>
        <title>{b.seoTitle || b.title} — StudySphere</title>
        <meta name="description" content={b.seoDescription || b.excerpt} />
      </Helmet>

      <Link
        to="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Blogs
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-950/10">
        <div className="aspect-[21/9] max-h-[420px] w-full overflow-hidden bg-zinc-100">
          <img
            src={coverUrl}
            alt={b.title}
            onError={(e) => {
              if (e.currentTarget.src !== DEFAULT_BLOG_IMAGE) {
                e.currentTarget.src = DEFAULT_BLOG_IMAGE;
              }
            }}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-5 p-6 sm:p-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {b.category} • {b.author}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-zinc-950">
            {b.title}
          </h1>
          <p className="text-base leading-relaxed text-zinc-700">{b.excerpt}</p>
          {b.content && (
            <div className="whitespace-pre-wrap border-t border-zinc-200 pt-6 text-sm leading-relaxed text-zinc-950">
              {b.content}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

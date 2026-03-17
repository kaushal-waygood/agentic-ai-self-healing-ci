import axios from 'axios';
import type { Metadata } from 'next';

import BlogsAllDetail from '@/sections/website/blog/blog-details';

// NEXT.JS 15 CHANGE: params is now a Promise
type PageProps = {
  params: Promise<{ slug: string }>;
};

type BlogSeo = {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  robots?: string[];
  openGraph?: {
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
    ogUrl?: string;
    ogImage?: string;
  };
  twitter?: {
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
};

type BlogData = {
  title?: string;
  shortDescription?: string;
  seo?: BlogSeo;
} & Record<string, unknown>;

const getBlogData = async (slug: string): Promise<BlogData | null> => {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_NODE_ENV === 'production'
        ? 'https://api.zobsai.com'
        : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
          ? 'https://api.dev.zobsai.com'
          : 'http://127.0.0.1:8080';

    const resp = await axios.get(`${API_BASE_URL}/api/v1/blog/view/${slug}`);

    return resp?.data?.data;
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return null;
  }
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // FIX: Await params before destructuring
  const { slug } = await params;
  const blogData = await getBlogData(slug);

  if (!blogData) {
    return {
      title: 'Blog Details',
    };
  }

  const { seo } = blogData;

  const title = seo?.metaTitle ?? blogData.title ?? 'Blog Details';
  const description = seo?.metaDescription ?? blogData.shortDescription ?? '';

  const openGraphTypeCandidates = new Set([
    'website',
    'article',
    'book',
    'profile',
    'music.song',
    'music.album',
    'music.playlist',
    'music.radio_station',
    'video.movie',
    'video.episode',
    'video.tv_show',
    'video.other',
  ]);

  const openGraphType =
    seo?.openGraph?.ogType && openGraphTypeCandidates.has(seo.openGraph.ogType)
      ? seo.openGraph.ogType
      : 'article';

  const twitterCardCandidates = new Set([
    'summary',
    'summary_large_image',
    'app',
    'player',
  ]);

  const twitterCard =
    seo?.twitter?.twitterCard &&
    twitterCardCandidates.has(seo.twitter.twitterCard)
      ? seo.twitter.twitterCard
      : 'summary_large_image';

  return {
    title,
    description,
    keywords: seo?.metaKeywords,
    alternates: {
      canonical: seo?.canonicalUrl,
    },
    robots: {
      index: Boolean(seo?.robots?.includes('index')),
      follow: Boolean(seo?.robots?.includes('follow')),
    },
    openGraph: {
      title: seo?.openGraph?.ogTitle ?? title,
      description: seo?.openGraph?.ogDescription ?? description,
      type: openGraphType as any,
      ...(seo?.openGraph?.ogUrl ? { url: seo.openGraph.ogUrl } : {}),
      ...(seo?.openGraph?.ogImage
        ? { images: [{ url: seo.openGraph.ogImage }] }
        : {}),
    },
    twitter: {
      card: twitterCard as any,
      title: seo?.twitter?.twitterTitle ?? title,
      description: seo?.twitter?.twitterDescription ?? description,
      ...(seo?.twitter?.twitterImage
        ? { images: [seo.twitter.twitterImage] }
        : {}),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const blogDetails = await getBlogData(slug);

  return (
    <div>
      <BlogsAllDetail initialBlogDetails={blogDetails} />
    </div>
  );
}

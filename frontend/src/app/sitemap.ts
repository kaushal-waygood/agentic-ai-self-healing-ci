// app/sitemap.ts
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

// Server-only: use process.env directly. Do NOT import from @/services/api (has 'use client')
const env = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV;

const SITE_URL =
  env === 'production'
    ? 'https://zobsai.com'
    : env === 'development'
      ? 'https://dev.zobsai.com'
      : 'http://localhost:3000';

// For local dev, always use local backend so sitemap gets jobs. NEXT_PUBLIC_API_URL may point to remote.
const BACKEND_URL = (
  env === 'local' || !env
    ? 'http://127.0.0.1:8080'
    : process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (env === 'production'
        ? 'https://api.zobsai.com'
        : 'https://api.dev.zobsai.com')
).replace(/\/$/, '');

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/sitemap`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error('Sitemap fetch error:', res.status, res.statusText);
      return getStaticSitemap();
    }

    const data = (await res.json()) as SitemapEntry[];
    const entries = Array.isArray(data) ? data : [];

    return entries
      .filter((e) => e.url && e.url.trim().length > 0)
      .map((e) => ({
        url: encodeURI(e.url.startsWith('http') ? e.url : `${SITE_URL}${e.url}`),
        lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
        changeFrequency: (e.changeFrequency as 'weekly' | 'daily') || 'daily',
        priority: e.priority ?? 0.8,
      }));
  } catch (error) {
    clearTimeout(timeout);
    console.error('Sitemap fetch error:', error);
    return getStaticSitemap();
  }
}

function getStaticSitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/search-jobs',
    '/privacy-policy',
    '/terms-of-service',
    '/cancellation-refundpolicy',
    '/cookie-policy',
    '/bug-report',
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/my-docs',
  ];

  return staticPaths
    .map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    }))
    .filter((p) => p.url && p.url.length > 0);
}

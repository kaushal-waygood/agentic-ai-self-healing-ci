// app/sitemap.ts
import axios from 'axios';
import type { MetadataRoute } from 'next';

// Recommendation: Use standard NODE_ENV unless you have a specific reason for NEXT_PUBLIC_NODE_ENV
const env = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV;

const SITE_URL =
  env === 'production'
    ? 'https://zobsai.com'
    : env === 'development'
      ? 'https://dev.zobsai.com'
      : 'http://localhost:3000';

const BACKEND_URL =
  env === 'production'
    ? 'https://api.zobsai.com'
    : env === 'development'
      ? 'https://api.dev.zobsai.com'
      : 'http://127.0.0.1:8080';

type Entry = { url: string; lastModified?: string };

async function fetchDynamicUrls(): Promise<Entry[]> {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/v1/sitemap-enteries`);
    // Axios handles the JSON parsing, just return res.data
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Sitemap fetch error:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  const dynamic = await fetchDynamicUrls();

  const dynamicPages: MetadataRoute.Sitemap = dynamic.map((e) => {
    const fullUrl = e.url.startsWith('http') ? e.url : `${SITE_URL}${e.url}`;
    return {
      url: encodeURI(fullUrl),
      lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  return [...staticPages, ...dynamicPages];
}

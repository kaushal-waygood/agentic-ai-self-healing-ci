// app/sitemap.ts

import axios from 'axios';
import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://zobsai.com'
    : process.env.NODE_ENV === 'development'
    ? 'https://dev.zobsai.com'
    : 'http://127.0.0.1:3000';
const BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NODE_ENV === 'development'
    ? 'https://api.dev.zobsai.com'
    : 'http://127.0.0.1:8080';

type Entry = { url: string; lastModified?: string };

async function fetchDynamicUrls(): Promise<Entry[]> {
  try {
    const res = await axios.get(BACKEND_URL);
    return res.status === 200 ? await res.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/search-jobs`, lastModified: new Date().toISOString() },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: new Date().toISOString(),
    },
    { url: `${SITE_URL}/bug-report`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/dashboard`, lastModified: new Date().toISOString() },
    {
      url: `${SITE_URL}/dashboard/profile`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${SITE_URL}/dashboard/my-docs`,
      lastModified: new Date().toISOString(),
    },
  ];

  const dynamic = await fetchDynamicUrls();

  const dynamicPages: MetadataRoute.Sitemap = dynamic.map((e) => {
    // If backend sends full URL, keep it.
    if (e.url.startsWith('http')) {
      return {
        url: encodeURI(e.url),
        lastModified: e.lastModified || new Date().toISOString(),
      };
    }

    // if backend sends "/jobs/slug"
    const encodedPath = encodeURI(e.url);
    return {
      url: `${SITE_URL}${encodedPath}`,
      lastModified: e.lastModified || new Date().toISOString(),
    };
  });

  return [...staticPages, ...dynamicPages];
}

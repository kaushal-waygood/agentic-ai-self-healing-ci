// app/robots.txt/route.ts
import { NextResponse } from 'next/server';
const SITE_URL = 'http://localhost:3000';
import { API_BASE_URL } from '@/services/api';

export function GET() {
  const sitemapUrl = `${API_BASE_URL}/sitemap.xml`;
  const body = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } });
}

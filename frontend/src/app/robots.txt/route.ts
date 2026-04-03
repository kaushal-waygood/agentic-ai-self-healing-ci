// app/robots.txt/route.ts
import { NextResponse } from 'next/server';
const env = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV;

const SITE_URL =
  env === 'production'
    ? 'https://zobsai.com'
    : env === 'development'
      ? 'https://dev.zobsai.com'
      : 'http://localhost:3000';

export function GET() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  const body = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } });
}

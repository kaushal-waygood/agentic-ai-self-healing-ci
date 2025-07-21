
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/primary-admin',
        destination: '/primary-admin/dashboard',
        permanent: true,
      },
    ]
  },
  // If you're using Vercel, analytics are often auto-injected or configured via Vercel project settings.
  // However, if explicit configuration is needed or for self-hosting, it might involve this.
  // For this exercise, assuming Analytics component is used as per Next.js/Vercel docs.
  // No specific config needed here for @vercel/analytics/react
};

export default nextConfig;

// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware function handles authentication logic for the application.
 * It runs before a request is completed, allowing for server-side redirection
 * based on the user's authentication status.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Configuration to specify which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This prevents the middleware from running on unnecessary asset requests.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

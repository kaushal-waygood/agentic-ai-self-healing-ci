// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware function handles authentication logic for the application.
 * It runs before a request is completed, allowing for server-side redirection
 * based on the user's authentication status.
 */
export function middleware(request: NextRequest) {
  // 1. Retrieve the authentication token from the request's cookies.
  const token = request.cookies.get('accessToken')?.value;
  console.log(token);

  // 2. Get the requested path from the URL.
  const { pathname } = request.nextUrl;

  // 3. Define which paths are considered authentication routes (public).
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // 4. Define which paths are protected and require a user to be logged in.
  const isProtectedPage = pathname.startsWith('/dashboard');

  // --- REDIRECTION LOGIC ---

  // Scenario A: If a logged-in user tries to access login/signup pages.
  if (isAuthPage && token) {
    // Redirect them to the main dashboard page.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Scenario B: If a non-logged-in user tries to access a protected page.
  if (isProtectedPage && !token) {
    // Redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. If none of the above conditions are met, allow the request to proceed.
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

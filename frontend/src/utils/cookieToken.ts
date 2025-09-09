import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// The function now accepts the cookie store as an argument instead of calling cookies() itself.
export function getToken(cookieStore: ReadonlyRequestCookies) {
  const token = cookieStore.get('accessToken')?.value;

  return token;
}

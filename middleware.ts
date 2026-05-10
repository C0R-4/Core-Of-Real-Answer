import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, images, and the login page/API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/login') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authToken = request.cookies.get('auth_token');

  if (!authToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login (handled manually inside)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/login|_next/static|_next/image|favicon.ico).*)',
  ],
};

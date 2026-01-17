import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ SECURITY FIX #5: CSRF Protection Middleware
 *
 * Protects against Cross-Site Request Forgery attacks by:
 * 1. Verifying Origin/Referer headers for mutating requests
 * 2. Ensuring requests come from the same domain
 * 3. Blocking requests from external domains
 */
export async function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }

  const { pathname, origin } = request.nextUrl;
  const method = request.method;

  // ✅ CSRF PROTECTION: Check for mutating HTTP methods
  const dangerousMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (dangerousMethods.includes(method)) {
    const requestOrigin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // For API routes, strictly enforce CSRF
    if (pathname.startsWith('/api/')) {
      // Skip CSRF for public endpoints (webhooks, public APIs)
      const publicEndpoints = [
        '/api/webhooks/',
        '/api/auth/signin',
        '/api/auth/callback',
        '/api/invitations/accept/',
        '/api/rgpd/dsar/request',
      ];

      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        pathname.startsWith(endpoint)
      );

      if (!isPublicEndpoint) {
        // Verify that request comes from same origin
        const isValidOrigin = requestOrigin && host && requestOrigin.includes(host);
        const isValidReferer = referer && host && referer.includes(host);

        if (!isValidOrigin && !isValidReferer) {
          // Log CSRF attempt for security monitoring
          if (process.env.NODE_ENV === 'production') {
            console.warn('[SECURITY] CSRF attempt blocked:', {
              path: pathname,
              method,
              origin: requestOrigin,
              referer,
              host,
              timestamp: new Date().toISOString(),
            });
          }

          return NextResponse.json(
            {
              error: 'CSRF validation failed',
              message: 'Request origin verification failed',
            },
            { status: 403 }
          );
        }
      }
    }
  }

  // ✅ AUTHENTICATION: Check if user is authenticated
  const session = await auth();

  // Public routes (allow without auth)
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublicRoute && !session?.user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ SECURITY HEADERS: Add security headers to response
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    // Dashboard and app routes
    '/dashboard/:path*',
    '/contacts/:path*',
    '/vehicles/:path*',
    '/quotes/:path*',
    '/invoices/:path*',
    '/tasks/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/catalog/:path*',
    '/planning/:path*',
    '/projects/:path*',
    '/accounting/:path*',
    '/team/:path*',
    '/communications/:path*',
    '/email/:path*',

    // API routes (for CSRF protection)
    '/api/:path*',
  ],
};

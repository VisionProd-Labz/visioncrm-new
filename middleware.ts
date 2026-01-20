import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomainFromHost, getTenantBySubdomain } from '@/lib/tenant';

/**
 * ✅ SECURITY FIX #5: CSRF Protection + Multi-Tenant Middleware
 *
 * - Protects against Cross-Site Request Forgery attacks
 * - Enforces tenant isolation via subdomains
 * - ⚠️ RATE LIMITING DISABLED for deployment testing
 */
export async function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }

  const { pathname, origin } = request.nextUrl;
  const method = request.method;
  const host = request.headers.get('host') || '';

  // ✅ MULTI-TENANT: Extract subdomain and validate tenant
  const subdomain = getSubdomainFromHost(host);
  let tenantId: string | null = null;

  if (subdomain) {
    // Check if tenant exists
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
      // Invalid subdomain - redirect to main domain
      console.warn(`[SECURITY] Invalid subdomain attempted: ${subdomain}`);
      const mainDomain = process.env.NEXTAUTH_URL || 'https://vision-crm.app';
      return NextResponse.redirect(new URL('/login?error=invalid_subdomain', mainDomain));
    }

    tenantId = tenant.id;
  }

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
        '/api/auth/',
        '/api/register',
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
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/api/auth', '/api/register', '/verify-email'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublicRoute && !session?.user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ TENANT ISOLATION: Verify user belongs to the tenant subdomain
  if (subdomain && tenantId && session?.user) {
    const userTenantId = (session.user as any).tenantId;

    if (userTenantId !== tenantId) {
      // User trying to access wrong tenant
      console.warn('[SECURITY] Tenant mismatch:', {
        subdomain,
        expectedTenantId: tenantId,
        userTenantId,
        userId: session.user.id,
      });

      // Redirect to correct tenant or logout
      return NextResponse.redirect(new URL('/login?error=wrong_tenant', origin));
    }
  }

  // ✅ SECURITY HEADERS: Add security headers to response
  const response = NextResponse.next();

  // Inject tenant headers for API routes
  if (tenantId && subdomain) {
    response.headers.set('x-tenant-id', tenantId);
    response.headers.set('x-tenant-subdomain', subdomain);
  }

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

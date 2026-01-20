import { handlers } from '@/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

console.log('🚀 [NEXTAUTH ROUTE V5] Auth handlers loaded');

// Export GET handler as-is (no rate limiting needed for OAuth callbacks)
export const { GET } = handlers;

// Wrap POST handler with rate limiting
const originalPOST = handlers.POST;

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  // Get client IP for rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // ✅ SECURITY FIX #2: Rate limiting on login
  const rateLimitResult = await checkRateLimit(ip, 'login');

  if (!rateLimitResult.allowed) {
    // Log rate limit attempt for security monitoring
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY] Rate limit exceeded for login', {
        ip,
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt.toISOString(),
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Too many login attempts',
        message: `Too many login attempts. Please try again later.`,
        resetAt: rateLimitResult.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
          ).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        },
      }
    );
  }

  // Call original POST handler (NextAuth handles params internally)
  return originalPOST(req);
}

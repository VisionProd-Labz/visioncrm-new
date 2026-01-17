import { handlers } from '@/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

console.log('🚀 [NEXTAUTH ROUTE V5] Auth handlers loaded');

// Export GET handler as-is (no rate limiting needed for OAuth callbacks)
export const { GET } = handlers;

// Wrap POST handler with rate limiting
const originalPOST = handlers.POST;

export async function POST(req: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  console.log('[AUTH ROUTE] POST request received from IP:', ip);

  // Apply rate limiting on ALL POST requests to /api/auth/*
  // This covers signin, register, etc.
  // Rate limiting is cheap with Redis, so we can afford to be broad here
  if (true) {  // Always apply rate limiting to POST /api/auth/*
    // ✅ SECURITY FIX #2: Rate limiting on login
    console.log('[AUTH ROUTE] Checking rate limit for IP:', ip);
    const rateLimitResult = await checkRateLimit(ip, 'login');
    console.log('[AUTH ROUTE] Rate limit result:', rateLimitResult);

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

    // Log successful rate limit check in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[RATE LIMIT] Login attempt allowed', {
        ip,
        remaining: rateLimitResult.remaining,
      });
    }
  }

  // Call original POST handler
  return originalPOST(req);
}

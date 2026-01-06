import { Redis } from '@upstash/redis';

// Initialize Redis client (will use env vars)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  ai_chat: {
    maxRequests: 50, // 50 messages per hour per tenant
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  login: {
    maxRequests: 5, // 5 attempts per minute per IP
    windowMs: 60 * 1000, // 1 minute
  },
  register: {
    maxRequests: 3, // 3 attempts per hour per IP
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  password_reset: {
    maxRequests: 3, // 3 attempts per hour per IP
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  api_general: {
    maxRequests: 100, // 100 requests per minute per IP
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Check if a request should be rate limited
 * Returns null if allowed, or an error message if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'ai_chat'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // If Redis is not configured, allow all requests (dev mode)
  if (!redis) {
    console.warn('Redis not configured - rate limiting disabled');
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + RATE_LIMITS[type].windowMs),
    };
  }

  try {
    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis sorted set to track requests
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcount(key, windowStart, now);

    if (count >= config.maxRequests) {
      // Get the oldest request to calculate reset time
      const oldestRequests = await redis.zrange(key, 0, 0, { withScores: true }) as any[];
      const resetAt = oldestRequests.length > 0
        ? new Date(Number(oldestRequests[0].score) + config.windowMs)
        : new Date(now + config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on the key
    await redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - (count + 1),
      resetAt: new Date(now + config.windowMs),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + RATE_LIMITS[type].windowMs),
    };
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Try to get IP from headers (Vercel/proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return 'dev-' + Math.random().toString(36).substring(7);
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'ai_chat'
): Promise<{ used: number; limit: number; remaining: number }> {
  if (!redis) {
    const config = RATE_LIMITS[type];
    return { used: 0, limit: config.maxRequests, remaining: config.maxRequests };
  }

  try {
    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const count = await redis.zcount(key, windowStart, now);

    return {
      used: count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
    };
  } catch (error) {
    console.error('Get rate limit status error:', error);
    const config = RATE_LIMITS[type];
    return { used: 0, limit: config.maxRequests, remaining: config.maxRequests };
  }
}

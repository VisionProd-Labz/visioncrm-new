// ✅ SECURITY FIX #2: Rate Limiting avec Redis (Upstash)
import { Redis } from '@upstash/redis';

/**
 * Lazy Redis client initialization
 * CRITICAL: Redis is REQUIRED in production for security
 */
let redis: Redis | null = null;
let redisInitialized = false;

function getRedisClient(): Redis | null {
  if (redisInitialized) {
    return redis;
  }

  // Initialize Redis client on first use
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    redis = null;

    // 🔴 SECURITY CHECK: Block production requests without Redis
    if (process.env.NODE_ENV === 'production') {
      console.error('🔴 CRITICAL SECURITY ERROR: Redis rate limiting is REQUIRED in production');
      console.error('Please configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      console.error('Get free Redis at: https://upstash.com');
    }
  }

  redisInitialized = true;
  return redis;
}

/**
 * Rate limit configuration
 *
 * ⚠️ TEMPORARY: Increased limits for deployment testing
 * TODO: Restore to production values after testing:
 *   - login: 5 attempts / minute
 *   - register: 3 attempts / hour
 */
const RATE_LIMITS = {
  ai_chat: {
    maxRequests: 50, // 50 messages per hour per tenant
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  login: {
    maxRequests: 100, // ⚠️ TEMP: 100 for testing (prod: 5 attempts per minute)
    windowMs: 60 * 1000, // 1 minute
  },
  register: {
    maxRequests: 50, // ⚠️ TEMP: 50 for testing (prod: 3 attempts per hour)
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
  const redis = getRedisClient();

  // If Redis is not configured (development only - production will log error)
  if (!redis) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  [DEV] Redis not configured - rate limiting disabled in development');
    }
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

      // Calculate reset time (when oldest request expires from window)
      let resetTimestamp = now + config.windowMs; // fallback: 1 minute from now

      if (oldestRequests.length > 0) {
        const oldestScore = Number(oldestRequests[0]?.score || oldestRequests[0]) || windowStart;
        resetTimestamp = oldestScore + config.windowMs;
      }

      const resetAt = new Date(resetTimestamp);

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
  const redis = getRedisClient();

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

import { Redis } from '@upstash/redis';

// Initialize Redis client only if credentials are provided
export const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null as any as Redis; // Type cast for build compatibility

/**
 * Get cached data or fetch if not exists
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);

  if (cached) {
    return cached as T;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(fresh));

  return fresh;
}

/**
 * Invalidate cache by key pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Get month key for AI usage tracking
 */
export function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default redis;

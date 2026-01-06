import { redis, getMonthKey } from './cache';
import { Plan } from '@prisma/client';

/**
 * AI query limits per plan
 */
const AI_LIMITS: Record<Plan, number> = {
  FREE: 10,
  STARTER: 100,
  PRO: 1000,
  ENTERPRISE: Infinity,
};

/**
 * Check if tenant has AI quota available
 */
export async function checkAIQuota(tenantId: string, plan: Plan): Promise<boolean> {
  const limit = AI_LIMITS[plan];

  if (limit === Infinity) {
    return true;
  }

  const key = `ai:quota:${tenantId}:${getMonthKey()}`;
  const usage = await redis.get(key);

  return (usage as number || 0) < limit;
}

/**
 * Increment AI usage counter
 */
export async function incrementAIUsage(tenantId: string): Promise<number> {
  const key = `ai:quota:${tenantId}:${getMonthKey()}`;
  const usage = await redis.incr(key);

  // Set expiry for 31 days if this is the first increment
  if (usage === 1) {
    await redis.expire(key, 31 * 24 * 60 * 60);
  }

  return usage as number;
}

/**
 * Get current AI usage for tenant
 */
export async function getAIUsage(tenantId: string): Promise<number> {
  const key = `ai:quota:${tenantId}:${getMonthKey()}`;
  const usage = await redis.get(key);
  return (usage as number) || 0;
}

/**
 * Get remaining AI quota
 */
export async function getRemainingQuota(tenantId: string, plan: Plan): Promise<number> {
  const limit = AI_LIMITS[plan];

  if (limit === Infinity) {
    return Infinity;
  }

  const usage = await getAIUsage(tenantId);
  return Math.max(0, limit - usage);
}

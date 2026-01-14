import { prisma } from './prisma';
import { auth } from '@/auth';

export type AccessAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'import';

export interface LogAccessParams {
  action: AccessAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  req?: Request;
  userId?: string;
  tenantId?: string;
}

/**
 * Log an access to a resource for GDPR compliance
 */
export async function logAccess({
  action,
  resourceType,
  resourceId,
  metadata,
  req,
  userId,
  tenantId,
}: LogAccessParams): Promise<void> {
  try {
    let finalUserId = userId;
    let finalTenantId = tenantId;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    // Get user ID and tenant ID from session if not provided
    if (!finalUserId || !finalTenantId) {
      const session = await auth();
      if (session?.user) {
        finalUserId = finalUserId || session.user.id;
        finalTenantId = finalTenantId || (session.user as any).tenantId;
      }
    }

    // Get IP and user agent from request if provided
    if (req) {
      ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
      userAgent = req.headers.get('user-agent') || undefined;
    }

    // Create access log
    await prisma.accessLog.create({
      data: {
        user_id: finalUserId,
        tenant_id: finalTenantId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    // Don't throw errors for logging failures to avoid breaking the main flow
    console.error('Failed to log access:', error);
  }
}

/**
 * Log a batch of accesses (useful for exports/imports)
 */
export async function logBatchAccess(
  params: Omit<LogAccessParams, 'resourceId'> & { resourceIds: string[] }
): Promise<void> {
  try {
    const { resourceIds, ...baseParams } = params;

    await Promise.all(
      resourceIds.map((resourceId) =>
        logAccess({
          ...baseParams,
          resourceId,
        })
      )
    );
  } catch (error) {
    console.error('Failed to log batch access:', error);
  }
}

/**
 * Get access logs for a specific resource
 */
export async function getResourceAccessLogs(
  resourceType: string,
  resourceId: string,
  options?: {
    limit?: number;
    tenantId?: string;
  }
) {
  const where: any = {
    resource_type: resourceType,
    resource_id: resourceId,
  };

  if (options?.tenantId) {
    where.tenant_id = options.tenantId;
  }

  return prisma.accessLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Get access logs for a specific user
 */
export async function getUserAccessLogs(
  userId: string,
  options?: {
    limit?: number;
    resourceType?: string;
  }
) {
  const where: any = {
    user_id: userId,
  };

  if (options?.resourceType) {
    where.resource_type = options.resourceType;
  }

  return prisma.accessLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Get access logs for a tenant
 */
export async function getTenantAccessLogs(
  tenantId: string,
  options?: {
    limit?: number;
    resourceType?: string;
    action?: AccessAction;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const where: any = {
    tenant_id: tenantId,
  };

  if (options?.resourceType) {
    where.resource_type = options.resourceType;
  }

  if (options?.action) {
    where.action = options.action;
  }

  if (options?.startDate || options?.endDate) {
    where.created_at = {};
    if (options.startDate) {
      where.created_at.gte = options.startDate;
    }
    if (options.endDate) {
      where.created_at.lte = options.endDate;
    }
  }

  return prisma.accessLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 100,
  });
}

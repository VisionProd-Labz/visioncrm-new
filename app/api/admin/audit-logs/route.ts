import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getTenantAccessLogs } from '@/lib/access-log';
import { requirePermission } from '@/lib/middleware/require-permission';

/**
 * GET /api/admin/audit-logs
 * Get access logs for audit purposes (admin only)
 * ✅ SECURITY FIX #3: Permission check added
 */
export async function GET(req: Request) {
  try {
    // ✅ Check permission FIRST
    const permError = await requirePermission('edit_settings');
    if (permError) return permError;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const resourceType = searchParams.get('resourceType') || undefined;
    const action = searchParams.get('action') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenant_id: (session.user as any).tenantId,
    };

    if (resourceType) {
      where.resource_type = resourceType;
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.user_id = userId;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.accessLog.count({ where }),
    ]);

    // Get unique user IDs from logs
    const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))] as string[];

    // Get user details for the logs
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Enrich logs with user details
    const enrichedLogs = logs.map(log => ({
      ...log,
      user: log.user_id ? userMap.get(log.user_id) : null,
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}

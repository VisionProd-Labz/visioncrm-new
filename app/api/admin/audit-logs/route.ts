/**
 * Admin API Route - Audit & Access Logs
 *
 * GET /api/admin/audit-logs
 *   Allows OWNER and SUPER_ADMIN to query logs for compliance and security monitoring
 *
 *   Query params:
 *   - type: "audit" | "access" (default: "audit")
 *   - limit: number (default 50, max 100)
 *   - offset: number (for pagination)
 *   - action: specific action to filter
 *   - entityType/resourceType: specific entity/resource type to filter
 *   - userId: filter by specific user
 *   - startDate: ISO date string
 *   - endDate: ISO date string
 *   - category: security|financial|gdpr (for audit logs only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  getTenantAuditLogs,
  getSecurityAuditLogs,
  getFinancialAuditLogs,
  getGDPRAuditLogs,
  countAuditLogs,
  type AuditAction,
  type EntityType,
} from '@/lib/audit/audit-logger';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';
import { requirePermission } from '@/lib/middleware/require-permission';

export async function GET(req: Request) {
  try {
    // Check permission
    const permError = await requirePermission('edit_settings');
    if (permError) return permError;

    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const tenantId = (session.user as any).tenantId;
    const { searchParams } = new URL(req.url);

    const logType = searchParams.get('type') || 'audit'; // "audit" or "access"
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType') || searchParams.get('resourceType');
    const filterUserId = searchParams.get('userId') || undefined;
    const category = searchParams.get('category');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Query ACCESS LOGS (GDPR compliance tracking)
    if (logType === 'access') {
      const where: any = {
        tenant_id: tenantId,
      };

      if (action) where.action = action;
      if (entityType) where.resource_type = entityType;
      if (filterUserId) where.user_id = filterUserId;
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = startDate;
        if (endDate) where.created_at.lte = endDate;
      }

      const [logs, total] = await Promise.all([
        prisma.accessLog.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.accessLog.count({ where }),
      ]);

      // Enrich with user details
      const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))] as string[];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map(u => [u.id, u]));

      const enrichedLogs = logs.map(log => ({
        ...log,
        user: log.user_id ? userMap.get(log.user_id) : null,
      }));

      return NextResponse.json({
        logs: enrichedLogs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    }

    // Query AUDIT LOGS (Critical business actions)
    let logs;
    let total;

    if (category === 'security') {
      logs = await getSecurityAuditLogs(tenantId, {
        limit,
        userId: filterUserId,
        startDate,
      });
      total = await countAuditLogs(tenantId, {
        actions: [
          'login_failed',
          'user_role_changed',
          'permission_granted',
          'permission_revoked',
          'team_member_removed',
          'api_key_created',
          'api_key_revoked',
        ] as AuditAction[],
        userId: filterUserId,
        startDate,
        endDate,
      });
    } else if (category === 'financial') {
      logs = await getFinancialAuditLogs(tenantId, {
        limit,
        startDate,
        endDate,
      });
      total = await countAuditLogs(tenantId, {
        actions: [
          'invoice_created',
          'invoice_updated',
          'invoice_deleted',
          'payment_received',
          'bank_account_created',
          'bank_account_deleted',
          'bank_reconciliation',
          'expense_approved',
          'expense_rejected',
        ] as AuditAction[],
        startDate,
        endDate,
      });
    } else if (category === 'gdpr') {
      logs = await getGDPRAuditLogs(tenantId, {
        limit,
        userId: filterUserId,
        startDate,
      });
      total = await countAuditLogs(tenantId, {
        actions: [
          'data_exported',
          'data_deleted',
          'gdpr_request_created',
          'gdpr_request_completed',
          'user_deleted',
        ] as AuditAction[],
        userId: filterUserId,
        startDate,
        endDate,
      });
    } else {
      // Custom filters
      logs = await getTenantAuditLogs(tenantId, {
        limit,
        offset,
        action: action as AuditAction | undefined,
        entityType: entityType as EntityType | undefined,
        userId: filterUserId,
        startDate,
        endDate,
      });
      total = await countAuditLogs(tenantId, {
        action: action as AuditAction | undefined,
        entityType: entityType as EntityType | undefined,
        userId: filterUserId,
        startDate,
        endDate,
      });
    }

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/admin/audit-logs',
      method: 'GET',
    });
  }
}

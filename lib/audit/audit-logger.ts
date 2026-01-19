/**
 * Audit Logging Service for Critical Actions
 *
 * Tracks critical business operations for:
 * - Security compliance
 * - Debugging and troubleshooting
 * - Fraud detection
 * - Regulatory requirements (GDPR, SOC 2)
 *
 * CRITICAL ACTIONS TRACKED:
 * - Authentication events (login, logout, failed attempts)
 * - Financial transactions (invoices, payments, bank reconciliation)
 * - Permission changes (role updates, team member changes)
 * - Data exports and deletions (GDPR compliance)
 * - Settings modifications (company, payment methods)
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Critical action types that require audit logging
 */
export type AuditAction =
  // Authentication
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | 'email_verified'

  // User & Team Management
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_role_changed'
  | 'team_member_invited'
  | 'team_member_removed'

  // Financial Operations
  | 'invoice_created'
  | 'invoice_updated'
  | 'invoice_deleted'
  | 'invoice_sent'
  | 'payment_received'
  | 'bank_account_created'
  | 'bank_account_deleted'
  | 'bank_reconciliation'
  | 'expense_approved'
  | 'expense_rejected'

  // Data Operations (GDPR)
  | 'data_exported'
  | 'data_deleted'
  | 'gdpr_request_created'
  | 'gdpr_request_completed'

  // Settings & Configuration
  | 'company_settings_updated'
  | 'payment_method_created'
  | 'payment_method_deleted'
  | 'vat_rate_created'
  | 'vat_rate_updated'

  // Access Control
  | 'permission_granted'
  | 'permission_revoked'
  | 'api_key_created'
  | 'api_key_revoked';

/**
 * Entity types that can be audited
 */
export type EntityType =
  | 'user'
  | 'tenant'
  | 'invoice'
  | 'quote'
  | 'contact'
  | 'expense'
  | 'bank_account'
  | 'payment'
  | 'company'
  | 'team_member'
  | 'settings'
  | 'api_key';

/**
 * Audit log entry parameters
 */
export interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  req?: Request;
  userId?: string;
  tenantId?: string;
  description?: string;
}

/**
 * Create an audit log entry for critical actions
 *
 * @example
 * ```typescript
 * await createAuditLog({
 *   action: 'invoice_created',
 *   entityType: 'invoice',
 *   entityId: invoice.id,
 *   metadata: { amount: invoice.total },
 *   req: request
 * });
 * ```
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const {
      action,
      entityType,
      entityId,
      changes,
      metadata,
      req,
      userId: providedUserId,
      tenantId: providedTenantId,
      description,
    } = params;

    let userId = providedUserId;
    let tenantId = providedTenantId;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    // Get user context from session if not provided
    if (!userId || !tenantId) {
      try {
        const session = await auth();
        if (session?.user) {
          userId = userId || session.user.id;
          tenantId = tenantId || (session.user as any).tenantId;
        }
      } catch (error) {
        // Session might not be available for some operations (logout, etc.)
        // Continue without userId/tenantId
      }
    }

    // Extract request context
    if (req) {
      ipAddress =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        undefined;
      userAgent = req.headers.get('user-agent') || undefined;
    }

    // Build changes object
    const changesData = changes
      ? {
          before: changes.before
            ? sanitizeForAudit(changes.before)
            : undefined,
          after: changes.after ? sanitizeForAudit(changes.after) : undefined,
        }
      : undefined;

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        tenant_id: tenantId!,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        changes: changesData,
        ip_address: ipAddress,
        user_agent: userAgent,
        // Merge description into metadata if provided
        ...(description || metadata
          ? {
              metadata: {
                ...(metadata || {}),
                ...(description ? { description } : {}),
              } as any,
            }
          : {}),
      },
    });
  } catch (error) {
    // Don't throw errors for audit logging failures
    // Log to console for debugging but don't break the main flow
    console.error('[AUDIT_LOG] Failed to create audit log:', {
      action: params.action,
      entityType: params.entityType,
      error,
    });
  }
}

/**
 * Create multiple audit log entries in batch
 */
export async function createBatchAuditLogs(
  logs: AuditLogParams[]
): Promise<void> {
  try {
    await Promise.all(logs.map((log) => createAuditLog(log)));
  } catch (error) {
    console.error('[AUDIT_LOG] Failed to create batch audit logs:', error);
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  entityType: EntityType,
  entityId: string,
  options?: {
    limit?: number;
    tenantId?: string;
  }
) {
  const where: any = {
    entity_type: entityType,
    entity_id: entityId,
  };

  if (options?.tenantId) {
    where.tenant_id = options.tenantId;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 50,
  });
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    action?: AuditAction;
    entityType?: EntityType;
  }
) {
  const where: any = {
    user_id: userId,
  };

  if (options?.action) {
    where.action = options.action;
  }

  if (options?.entityType) {
    where.entity_type = options.entityType;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 50,
  });
}

/**
 * Get audit logs for a tenant with advanced filtering
 */
export async function getTenantAuditLogs(
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    actions?: AuditAction[];
    entityType?: EntityType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const where: any = {
    tenant_id: tenantId,
  };

  if (options?.action) {
    where.action = options.action;
  }

  if (options?.actions && options.actions.length > 0) {
    where.action = { in: options.actions };
  }

  if (options?.entityType) {
    where.entity_type = options.entityType;
  }

  if (options?.userId) {
    where.user_id = options.userId;
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

  return prisma.auditLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

/**
 * Get count of audit logs matching criteria
 */
export async function countAuditLogs(
  tenantId: string,
  filters?: {
    action?: AuditAction;
    actions?: AuditAction[];
    entityType?: EntityType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<number> {
  const where: any = {
    tenant_id: tenantId,
  };

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.actions && filters.actions.length > 0) {
    where.action = { in: filters.actions };
  }

  if (filters?.entityType) {
    where.entity_type = filters.entityType;
  }

  if (filters?.userId) {
    where.user_id = filters.userId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.created_at = {};
    if (filters.startDate) {
      where.created_at.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.created_at.lte = filters.endDate;
    }
  }

  return prisma.auditLog.count({ where });
}

/**
 * Get security-related audit logs (failed logins, permission changes)
 */
export async function getSecurityAuditLogs(
  tenantId: string,
  options?: {
    limit?: number;
    userId?: string;
    startDate?: Date;
  }
) {
  const securityActions: AuditAction[] = [
    'login_failed',
    'user_role_changed',
    'permission_granted',
    'permission_revoked',
    'team_member_removed',
    'api_key_created',
    'api_key_revoked',
  ];

  return getTenantAuditLogs(tenantId, {
    ...options,
    actions: securityActions,
  });
}

/**
 * Get financial audit logs (invoices, payments, expenses)
 */
export async function getFinancialAuditLogs(
  tenantId: string,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const financialActions: AuditAction[] = [
    'invoice_created',
    'invoice_updated',
    'invoice_deleted',
    'payment_received',
    'bank_account_created',
    'bank_account_deleted',
    'bank_reconciliation',
    'expense_approved',
    'expense_rejected',
  ];

  return getTenantAuditLogs(tenantId, {
    ...options,
    actions: financialActions,
  });
}

/**
 * Get GDPR-related audit logs (data exports, deletions)
 */
export async function getGDPRAuditLogs(
  tenantId: string,
  options?: {
    limit?: number;
    userId?: string;
    startDate?: Date;
  }
) {
  const gdprActions: AuditAction[] = [
    'data_exported',
    'data_deleted',
    'gdpr_request_created',
    'gdpr_request_completed',
    'user_deleted',
  ];

  return getTenantAuditLogs(tenantId, {
    ...options,
    actions: gdprActions,
  });
}

/**
 * Sanitize data for audit logging (remove sensitive fields)
 */
function sanitizeForAudit(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password',
    'password_hash',
    'api_key',
    'secret',
    'token',
    'private_key',
    'access_token',
    'refresh_token',
  ];

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Skip sensitive fields
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForAudit(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper function to extract changes between old and new objects
 *
 * @example
 * ```typescript
 * const changes = extractChanges(oldInvoice, newInvoice);
 * await createAuditLog({
 *   action: 'invoice_updated',
 *   entityType: 'invoice',
 *   entityId: invoice.id,
 *   changes
 * });
 * ```
 */
export function extractChanges(
  before: Record<string, any>,
  after: Record<string, any>
): { before: Record<string, any>; after: Record<string, any> } {
  const changes = {
    before: {} as Record<string, any>,
    after: {} as Record<string, any>,
  };

  // Compare all fields in 'after' object
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes.before[key] = before[key];
      changes.after[key] = after[key];
    }
  }

  // Check for removed fields
  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      changes.before[key] = before[key];
      changes.after[key] = null;
    }
  }

  return changes;
}

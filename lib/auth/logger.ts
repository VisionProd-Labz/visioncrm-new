/**
 * Authentication Logger
 *
 * Centralized, structured logging for authentication events
 * Replaces 15+ conditional console.log statements in auth.ts
 */

/**
 * Authentication event types
 */
export type AuthEvent =
  | 'authorize_attempt'
  | 'authorize_success'
  | 'authorize_failed'
  | 'missing_credentials'
  | 'user_not_found'
  | 'invalid_password'
  | 'tenant_deleted'
  | 'missing_tenant_id'
  | 'jwt_callback'
  | 'session_callback'
  | 'auth_error';

/**
 * Log context (sanitized for security)
 */
interface AuthLogContext {
  userId?: string;
  tenantId?: string;
  role?: string;
  trigger?: string;
  hasToken?: boolean;
  hasUser?: boolean;
  [key: string]: unknown;
}

/**
 * Check if we should log (development only by default)
 */
function shouldLog(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log authentication event
 *
 * @param event - Event type
 * @param context - Event context (will be sanitized)
 * @param level - Log level (info, warn, error)
 *
 * @example
 * ```typescript
 * logAuthEvent('authorize_success', { userId: user.id, tenantId: user.tenantId, role: user.role });
 * ```
 */
export function logAuthEvent(
  event: AuthEvent,
  context?: AuthLogContext,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  if (!shouldLog()) {
    // In production, only log errors
    if (level !== 'error') return;

    // Log minimal info without sensitive data
    console.error(`[AUTH] ${event}`);
    return;
  }

  // Development: detailed structured logging
  const emoji = getEventEmoji(event);
  const message = getEventMessage(event);

  const logData = {
    event,
    timestamp: new Date().toISOString(),
    ...(context || {}),
  };

  switch (level) {
    case 'error':
      console.error(`${emoji} [AUTH] ${message}`, logData);
      break;
    case 'warn':
      console.warn(`${emoji} [AUTH] ${message}`, logData);
      break;
    default:
      console.log(`${emoji} [AUTH] ${message}`, logData);
  }
}

/**
 * Log authorization attempt
 */
export function logAuthorizeAttempt(): void {
  logAuthEvent('authorize_attempt');
}

/**
 * Log successful authorization
 */
export function logAuthorizeSuccess(context: {
  userId: string;
  tenantId: string;
  role: string;
}): void {
  logAuthEvent('authorize_success', context);
}

/**
 * Log failed authorization
 */
export function logAuthorizeFailed(reason: AuthEvent, context?: AuthLogContext): void {
  logAuthEvent(reason, context, 'warn');
}

/**
 * Log JWT callback
 */
export function logJwtCallback(context: {
  hasUser: boolean;
  trigger?: string;
  hasToken: boolean;
}): void {
  logAuthEvent('jwt_callback', context);
}

/**
 * Log session callback
 */
export function logSessionCallback(context: { hasToken: boolean }): void {
  logAuthEvent('session_callback', context);
}

/**
 * Log authentication error
 */
export function logAuthError(error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    logAuthEvent('auth_error', { error }, 'error');
  } else {
    // Production: log without details
    console.error('[AUTH] Authentication error');
  }
}

/**
 * Get emoji for event type
 */
function getEventEmoji(event: AuthEvent): string {
  const emojiMap: Record<AuthEvent, string> = {
    authorize_attempt: '🔑',
    authorize_success: '✅',
    authorize_failed: '❌',
    missing_credentials: '⚠️',
    user_not_found: '🔍',
    invalid_password: '🔒',
    tenant_deleted: '🗑️',
    missing_tenant_id: '⚠️',
    jwt_callback: '🎟️',
    session_callback: '📝',
    auth_error: '🔴',
  };
  return emojiMap[event] || '🔧';
}

/**
 * Get human-readable message for event
 */
function getEventMessage(event: AuthEvent): string {
  const messageMap: Record<AuthEvent, string> = {
    authorize_attempt: 'Login attempt',
    authorize_success: 'Authentication successful',
    authorize_failed: 'Authentication failed',
    missing_credentials: 'Missing credentials',
    user_not_found: 'User not found or no password',
    invalid_password: 'Invalid password',
    tenant_deleted: 'Tenant deleted',
    missing_tenant_id: 'No tenantId',
    jwt_callback: 'JWT callback',
    session_callback: 'Session callback',
    auth_error: 'Authentication error',
  };
  return messageMap[event] || 'Unknown event';
}

/**
 * Create audit log entry for security monitoring
 *
 * In production, this should send to a logging service (Sentry, Datadog, etc.)
 */
export function createAuthAuditLog(
  event: AuthEvent,
  context: AuthLogContext,
  metadata?: Record<string, unknown>
): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    event,
    context: {
      userId: context.userId,
      tenantId: context.tenantId,
      role: context.role,
    },
    metadata: metadata || {},
    environment: process.env.NODE_ENV,
  };

  // TODO: Send to logging service in production
  // Example: Sentry.captureMessage('auth_event', { extra: auditEntry });

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(auditEntry, null, 2));
  }
}

/**
 * Sentry Monitoring Wrapper
 *
 * Safe wrapper around Sentry that won't break if Sentry is not installed
 * Allows gradual rollout and development without Sentry dependency
 */

let Sentry: typeof import('@sentry/nextjs') | null = null;

// Try to import Sentry (will fail gracefully if not installed)
try {
  // Dynamic import to avoid build errors if Sentry is not installed
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.log('[MONITORING] Sentry not installed - error tracking disabled');
}

/**
 * Check if Sentry is available and enabled
 */
export function isSentryAvailable(): boolean {
  return Sentry !== null && process.env.NODE_ENV === 'production';
}

/**
 * Capture exception to Sentry (safe - won't throw if Sentry unavailable)
 */
export function captureException(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id: string };
  }
): void {
  if (!isSentryAvailable() || !Sentry) {
    // Sentry not available - log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[MONITORING] Would capture to Sentry:', {
        error,
        context,
      });
    }
    return;
  }

  try {
    Sentry.captureException(error, context);
  } catch (err) {
    console.error('[MONITORING] Failed to capture exception to Sentry:', err);
  }
}

/**
 * Capture message to Sentry (safe - won't throw if Sentry unavailable)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  if (!isSentryAvailable() || !Sentry) {
    return;
  }

  try {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } catch (err) {
    console.error('[MONITORING] Failed to capture message to Sentry:', err);
  }
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!isSentryAvailable() || !Sentry) {
    return;
  }

  try {
    if (user) {
      Sentry.setUser(user);
    } else {
      Sentry.setUser(null);
    }
  } catch (err) {
    console.error('[MONITORING] Failed to set user context:', err);
  }
}

/**
 * Add breadcrumb to Sentry
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!isSentryAvailable() || !Sentry) {
    return;
  }

  try {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  } catch (err) {
    console.error('[MONITORING] Failed to add breadcrumb:', err);
  }
}

export default {
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  isSentryAvailable,
};

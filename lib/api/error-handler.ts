/**
 * Centralized API Error Handling
 *
 * Replaces 240+ duplicate error handlers across API routes
 * Provides structured logging and consistent error responses
 * Integrates with Sentry for production error tracking
 */

import { NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring/sentry';

/**
 * Custom API Error class with HTTP status codes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Common API error types
 */
export const ApiErrors = {
  // 400 - Bad Request
  BadRequest: (message: string, details?: unknown) =>
    new ApiError(message, 400, 'BAD_REQUEST', details),

  // 401 - Unauthorized
  Unauthorized: (message = 'Non authentifié') =>
    new ApiError(message, 401, 'UNAUTHORIZED'),

  // 403 - Forbidden
  Forbidden: (message = 'Permission refusée') =>
    new ApiError(message, 403, 'FORBIDDEN'),

  // 404 - Not Found
  NotFound: (resource: string) =>
    new ApiError(`${resource} non trouvé(e)`, 404, 'NOT_FOUND'),

  // 409 - Conflict
  Conflict: (message: string) =>
    new ApiError(message, 409, 'CONFLICT'),

  // 422 - Validation Error
  Validation: (message: string, details?: unknown) =>
    new ApiError(message, 422, 'VALIDATION_ERROR', details),

  // 500 - Internal Server Error
  Internal: (message = 'Erreur serveur interne') =>
    new ApiError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Structured error logging
 */
interface ErrorLogContext {
  route?: string;
  method?: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  [key: string]: unknown;
}

function logError(error: unknown, context: ErrorLogContext = {}) {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  const logData = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    } : error,
    context,
  };

  if (isDev) {
    // Development: Detailed console logging
    console.error('🔴 API Error:', JSON.stringify(logData, null, 2));
  } else {
    // Production: Structured JSON logging (for log aggregation services)
    console.error(JSON.stringify(logData));
  }

  // Send to Sentry in production (only for 500-level errors and unexpected errors)
  if (isProd && error) {
    // Skip 4xx client errors (they're not bugs)
    const isClientError = error instanceof ApiError && error.statusCode < 500;

    if (!isClientError) {
      captureException(error, {
        tags: {
          ...(context.route && { route: context.route }),
          ...(context.method && { method: context.method }),
        },
        extra: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        user: context.userId ? {
          id: context.userId,
        } : undefined,
      });
    }
  }
}

/**
 * Main error handler - converts errors to NextResponse
 */
export function handleApiError(
  error: unknown,
  context: ErrorLogContext = {}
): NextResponse {
  // Log the error with context
  logError(error, context);

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && error.details
          ? { details: error.details }
          : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown };

    // P2002: Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cette ressource existe déjà', code: 'DUPLICATE' },
        { status: 409 }
      );
    }

    // P2025: Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ressource non trouvée', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ message: string; path: string[] }> };
    return NextResponse.json(
      {
        error: 'Erreur de validation',
        code: 'VALIDATION_ERROR',
        details: process.env.NODE_ENV === 'development'
          ? zodError.issues
          : undefined,
      },
      { status: 422 }
    );
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: isDev ? error.message : 'Erreur serveur interne',
        code: 'INTERNAL_ERROR',
        ...(isDev ? { stack: error.stack } : {}),
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: 'Erreur serveur interne',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Error handler wrapper for async route handlers
 *
 * Usage:
 * ```typescript
 * export const GET = withErrorHandler(async (req) => {
 *   // Your route logic
 *   throw ApiErrors.NotFound('Project');
 * }, { route: '/api/projects' });
 * ```
 */
export function withErrorHandler(
  handler: (req: Request, context: { params: unknown }) => Promise<NextResponse>,
  errorContext: ErrorLogContext = {}
) {
  return async (req: Request, context: { params: unknown }) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error, {
        ...errorContext,
        method: req.method,
        url: req.url,
      });
    }
  };
}

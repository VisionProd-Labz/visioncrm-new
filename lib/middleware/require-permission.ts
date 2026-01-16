/**
 * ✅ SECURITY FIX #3: RBAC Permission Middleware
 *
 * Middleware to enforce role-based access control on API routes
 * CRITICAL: This middleware MUST be called BEFORE any database operation
 */

import { auth } from '@/auth';
import { hasPermission, type Permission, type Role } from '@/lib/permissions';
import { NextResponse } from 'next/server';

/**
 * Require a specific permission to access an API route
 * Returns null if permission is granted, or a NextResponse with error if denied
 *
 * @example
 * ```typescript
 * export async function DELETE(req: NextRequest, { params }) {
 *   // ✅ Check permission FIRST
 *   const permError = await requirePermission('delete_contacts');
 *   if (permError) return permError;
 *
 *   // ... proceed with deletion
 * }
 * ```
 */
export async function requirePermission(
  permission: Permission
): Promise<NextResponse | null> {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      },
      { status: 401 }
    );
  }

  // Get user role
  const user = session.user as any;
  const role = user.role as Role;

  if (!role) {
    return NextResponse.json(
      {
        error: 'Invalid user role',
        message: 'Votre rôle utilisateur est invalide',
      },
      { status: 403 }
    );
  }

  // Check permission
  if (!hasPermission(role, permission)) {
    // Log unauthorized attempt (for security audit)
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY] Unauthorized access attempt:', {
        userId: user.id,
        role: role,
        requiredPermission: permission,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Permission denied',
        message: `Vous n'avez pas la permission requise: ${permission}`,
        required_permission: permission,
        current_role: role,
      },
      { status: 403 }
    );
  }

  // Permission granted
  return null;
}

/**
 * Require authentication (without checking specific permission)
 * Use this for routes that only need authentication, not specific permissions
 *
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const authError = await requireAuth();
 *   if (authError) return authError;
 *
 *   // ... proceed
 * }
 * ```
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      },
      { status: 401 }
    );
  }

  return null;
}

/**
 * Require any of the specified permissions
 * User needs at least ONE of the permissions
 *
 * @example
 * ```typescript
 * // Allow if user can either view or edit contacts
 * const permError = await requireAnyPermission(['view_contacts', 'edit_contacts']);
 * ```
 */
export async function requireAnyPermission(
  permissions: Permission[]
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      },
      { status: 401 }
    );
  }

  const user = session.user as any;
  const role = user.role as Role;

  // Check if user has ANY of the permissions
  const hasAny = permissions.some((permission) => hasPermission(role, permission));

  if (!hasAny) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY] Unauthorized access attempt:', {
        userId: user.id,
        role: role,
        requiredPermissions: permissions,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Permission denied',
        message: `Vous n'avez aucune des permissions requises`,
        required_permissions: permissions,
        current_role: role,
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Require all of the specified permissions
 * User needs ALL permissions
 *
 * @example
 * ```typescript
 * // Allow only if user can both view and edit contacts
 * const permError = await requireAllPermissions(['view_contacts', 'edit_contacts']);
 * ```
 */
export async function requireAllPermissions(
  permissions: Permission[]
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      },
      { status: 401 }
    );
  }

  const user = session.user as any;
  const role = user.role as Role;

  // Check if user has ALL permissions
  const hasAll = permissions.every((permission) => hasPermission(role, permission));

  if (!hasAll) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY] Unauthorized access attempt:', {
        userId: user.id,
        role: role,
        requiredPermissions: permissions,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Permission denied',
        message: `Vous n'avez pas toutes les permissions requises`,
        required_permissions: permissions,
        current_role: role,
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Require specific role(s)
 * Use this when you need to restrict to specific roles, not permissions
 *
 * @example
 * ```typescript
 * // Only OWNER and SUPER_ADMIN can access
 * const roleError = await requireRole(['OWNER', 'SUPER_ADMIN']);
 * ```
 */
export async function requireRole(
  roles: Role[]
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      },
      { status: 401 }
    );
  }

  const user = session.user as any;
  const role = user.role as Role;

  if (!roles.includes(role)) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY] Unauthorized access attempt:', {
        userId: user.id,
        role: role,
        requiredRoles: roles,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Access denied',
        message: `Cette action est réservée aux rôles: ${roles.join(', ')}`,
        required_roles: roles,
        current_role: role,
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Get current user from session
 * Helper to avoid repeating auth() calls
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get current user role
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await auth();
  const user = session?.user as any;
  return user?.role ?? null;
}

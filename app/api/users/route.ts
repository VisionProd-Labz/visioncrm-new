import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/users
 * List users in the current tenant
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_team')) {
      throw ApiErrors.Forbidden('Permission requise: view_team');
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/users',
      method: 'GET',
    });
  }
}

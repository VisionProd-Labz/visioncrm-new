import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/team
 * List team members
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

    // Get all team members for this tenant
    const members = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        mfaEnabled: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Count assignments for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const [taskCount, activityCount] = await Promise.all([
          prisma.task.count({
            where: {
              assignee: {
                id: member.id,
              },
              deleted_at: null,
            },
          }),
          prisma.activity.count({
            where: {
              user_id: member.id,
            },
          }),
        ]);

        return {
          ...member,
          stats: {
            tasks: taskCount,
            activities: activityCount,
          },
        };
      })
    );

    return NextResponse.json({
      members: membersWithStats,
      total: members.length,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/team',
      method: 'GET',
    });
  }
}

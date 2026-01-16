import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';

// GET /api/team - List team members
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_team');
    if (permError) return permError;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
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
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    );
  }
}

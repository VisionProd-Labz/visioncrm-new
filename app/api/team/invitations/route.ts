import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';

// GET /api/team/invitations - List pending invitations
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

    // Get pending invitations (not accepted and not expired)
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        tenant_id: tenantId,
        accepted_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        expires_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      invitations,
      total: invitations.length,
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    );
  }
}

// DELETE /api/team/invitations - Cancel an invitation
export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get('id');

    if (!invitationId) {
      return NextResponse.json(
        { error: 'ID d\'invitation manquant' },
        { status: 400 }
      );
    }

    // Delete invitation
    await prisma.teamInvitation.delete({
      where: {
        id: invitationId,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json({ message: 'Invitation annulée' });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'invitation' },
      { status: 500 }
    );
  }
}

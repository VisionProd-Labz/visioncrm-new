import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['USER', 'MANAGER', 'ACCOUNTANT', 'OWNER']).optional(),
  name: z.string().min(1).max(255).optional(),
});

// PATCH /api/team/[id] - Update team member
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const { id } = await params;

    // Check if current user has permission (OWNER or MANAGER)
    const currentUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        tenantId: tenantId,
      },
    });

    if (!currentUser || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier les membres' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = updateMemberSchema.parse(body);

    // Get member to update
    const member = await prisma.user.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // Prevent changing own role unless SUPER_ADMIN
    if (member.id === currentUser.id && data.role && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      );
    }

    // Prevent non-OWNER from changing OWNER role
    if (member.role === 'OWNER' && currentUser.role !== 'OWNER' && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut modifier ce rôle' },
        { status: 403 }
      );
    }

    // Update member
    const updatedMember = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.name && { name: data.name }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du membre' },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id] - Remove team member
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const { id } = await params;

    // Check if current user has permission (OWNER only)
    const currentUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        tenantId: tenantId,
      },
    });

    if (!currentUser || !['OWNER', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut supprimer des membres' },
        { status: 403 }
      );
    }

    // Get member to delete
    const member = await prisma.user.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (member.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 403 }
      );
    }

    // Soft delete member
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du membre' },
      { status: 500 }
    );
  }
}

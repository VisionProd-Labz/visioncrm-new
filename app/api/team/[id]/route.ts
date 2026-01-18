import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['USER', 'MANAGER', 'ACCOUNTANT', 'OWNER']).optional(),
  name: z.string().min(1).max(255).optional(),
});

/**
 * PATCH /api/team/:id
 * Update team member
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const tenantId = user.tenantId as string;

    const currentUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        tenantId,
      },
    });

    if (!currentUser || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(currentUser.role)) {
      throw ApiErrors.Forbidden('Vous n\'avez pas la permission de modifier les membres');
    }

    const body = await req.json();
    const data = updateMemberSchema.parse(body);

    const member = await prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!member) {
      throw ApiErrors.NotFound('Membre');
    }

    // Prevent changing own role unless SUPER_ADMIN
    if (member.id === currentUser.id && data.role && currentUser.role !== 'SUPER_ADMIN') {
      throw ApiErrors.Forbidden('Vous ne pouvez pas modifier votre propre rôle');
    }

    // Prevent non-OWNER from changing OWNER role
    if (member.role === 'OWNER' && currentUser.role !== 'OWNER' && currentUser.role !== 'SUPER_ADMIN') {
      throw ApiErrors.Forbidden('Seul le propriétaire peut modifier ce rôle');
    }

    const updatedMember = await prisma.user.update({
      where: { id },
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
    return handleApiError(error, {
      route: `/api/team/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/team/:id
 * Remove team member
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const tenantId = user.tenantId as string;

    const currentUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        tenantId,
      },
    });

    if (!currentUser || !['OWNER', 'SUPER_ADMIN'].includes(currentUser.role)) {
      throw ApiErrors.Forbidden('Seul le propriétaire peut supprimer des membres');
    }

    const member = await prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!member) {
      throw ApiErrors.NotFound('Membre');
    }

    // Prevent deleting yourself
    if (member.id === currentUser.id) {
      throw ApiErrors.Forbidden('Vous ne pouvez pas vous supprimer vous-même');
    }

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/team/${id}`,
      method: 'DELETE',
    });
  }
}

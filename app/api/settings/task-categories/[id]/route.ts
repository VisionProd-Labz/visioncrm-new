import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const taskCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

/**
 * PATCH /api/settings/task-categories/:id
 * Update task category
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
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'edit_settings')) {
      throw ApiErrors.Forbidden('Permission requise: edit_settings');
    }

    const body = await req.json();
    const data = taskCategoryUpdateSchema.parse(body);

    const existing = await prisma.taskCategory.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Catégorie de tâche');
    }

    // If setting as default, unset other defaults
    if (data.is_default) {
      await prisma.taskCategory.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const category = await prisma.taskCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/task-categories/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/settings/task-categories/:id
 * Delete task category
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
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'edit_settings')) {
      throw ApiErrors.Forbidden('Permission requise: edit_settings');
    }

    const existing = await prisma.taskCategory.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Catégorie de tâche');
    }

    // Prevent deletion of default category
    if (existing.is_default) {
      throw ApiErrors.BadRequest('Impossible de supprimer la catégorie de tâche par défaut');
    }

    await prisma.taskCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/task-categories/${id}`,
      method: 'DELETE',
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/tasks/:id
 * Get a single task
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(
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

    if (!hasPermission(role, 'view_tasks')) {
      throw ApiErrors.Forbidden('Permission requise: view_tasks');
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    if (!task) {
      throw ApiErrors.NotFound('Tâche');
    }

    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/tasks/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/tasks/:id
 * Update a task
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

    if (!hasPermission(role, 'edit_tasks')) {
      throw ApiErrors.Forbidden('Permission requise: edit_tasks');
    }

    const body = await req.json();

    const existing = await prisma.task.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Tâche');
    }

    // Build update data
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.assignee_id !== undefined) updateData.assignee_id = body.assignee_id || null;
    if (body.contact_id !== undefined) updateData.contact_id = body.contact_id || null;
    if (body.due_date !== undefined) updateData.due_date = body.due_date ? new Date(body.due_date) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;

    // Mark as completed if status is DONE
    if (body.status === 'DONE' && !existing.completed_at) {
      updateData.completed_at = new Date();
    }

    // Remove completed_at if status is not DONE
    if (body.status && body.status !== 'DONE') {
      updateData.completed_at = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/tasks/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/tasks/:id
 * Soft delete a task
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

    if (!hasPermission(role, 'delete_tasks')) {
      throw ApiErrors.Forbidden('Permission requise: delete_tasks');
    }

    const existing = await prisma.task.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Tâche');
    }

    await prisma.task.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Tâche supprimée' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/tasks/${id}`,
      method: 'DELETE',
    });
  }
}

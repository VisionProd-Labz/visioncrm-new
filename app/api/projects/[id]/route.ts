import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  contactId: z.string().optional(),
  quoteId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/projects/[id]
 * Get a single project
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

    if (!hasPermission(role, 'view_projects')) {
      throw ApiErrors.Forbidden('Permission requise: view_projects');
    }

    const project = await prisma.project.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        quote: {
          select: {
            id: true,
            quote_number: true,
            total: true,
            status: true,
          },
        },
        tasks: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            due_date: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw ApiErrors.NotFound('Project');
    }

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/projects/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project
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

    if (!hasPermission(role, 'edit_projects')) {
      throw ApiErrors.Forbidden('Permission requise: edit_projects');
    }

    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existingProject) {
      throw ApiErrors.NotFound('Project');
    }

    const project = await prisma.project.update({
      where: { id: id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.contactId !== undefined && { contact_id: data.contactId || null }),
        ...(data.quoteId !== undefined && { quote_id: data.quoteId || null }),
        ...(data.startDate && { start_date: new Date(data.startDate) }),
        ...(data.endDate && { end_date: new Date(data.endDate) }),
      },
      include: {
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        quote: {
          select: {
            id: true,
            quote_number: true,
            total: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/projects/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft delete a project
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

    if (!hasPermission(role, 'delete_projects')) {
      throw ApiErrors.Forbidden('Permission requise: delete_projects');
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existingProject) {
      throw ApiErrors.NotFound('Project');
    }

    await prisma.project.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/projects/${id}`,
      method: 'DELETE',
    });
  }
}

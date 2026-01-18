import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/accounting/litigation/[id]
 * Get a single litigation case by ID
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

    if (!hasPermission(role, 'view_litigation')) {
      throw ApiErrors.Forbidden('Permission requise: view_litigation');
    }

    const litigationCase = await prisma.litigation.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!litigationCase) {
      throw ApiErrors.NotFound('Litige');
    }

    return NextResponse.json(litigationCase);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/litigation/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/accounting/litigation/[id]
 * Update a litigation case
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

    if (!hasPermission(role, 'edit_litigation')) {
      throw ApiErrors.Forbidden('Permission requise: edit_litigation');
    }

    const body = await req.json();
    const data = body;

    const existing = await prisma.litigation.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Litige');
    }

    const litigationCase = await prisma.litigation.update({
      where: { id },
      data,
    });

    return NextResponse.json(litigationCase);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/litigation/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/accounting/litigation/[id]
 * Soft delete a litigation case
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

    if (!hasPermission(role, 'delete_litigation')) {
      throw ApiErrors.Forbidden('Permission requise: delete_litigation');
    }

    const existing = await prisma.litigation.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Litige');
    }

    await prisma.litigation.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/litigation/${id}`,
      method: 'DELETE',
    });
  }
}

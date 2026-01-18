import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/accounting/inventory/[id]
 * Get a single inventory item by ID
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

    if (!hasPermission(role, 'view_inventory')) {
      throw ApiErrors.Forbidden('Permission requise: view_inventory');
    }

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!item) {
      throw ApiErrors.NotFound('Article');
    }

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/inventory/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/accounting/inventory/[id]
 * Update an inventory item
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

    if (!hasPermission(role, 'edit_inventory')) {
      throw ApiErrors.Forbidden('Permission requise: edit_inventory');
    }

    const body = await req.json();
    const data = body;

    const existing = await prisma.inventoryItem.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Article');
    }

    if (data.sku && data.sku !== existing.sku) {
      const duplicate = await prisma.inventoryItem.findFirst({
        where: {
          tenant_id: tenantId,
          sku: data.sku,
          deleted_at: null,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw ApiErrors.BadRequest('Un article avec ce SKU existe déjà');
      }
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/inventory/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/accounting/inventory/[id]
 * Soft delete an inventory item
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

    if (!hasPermission(role, 'delete_inventory')) {
      throw ApiErrors.Forbidden('Permission requise: delete_inventory');
    }

    const existing = await prisma.inventoryItem.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Article');
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/inventory/${id}`,
      method: 'DELETE',
    });
  }
}

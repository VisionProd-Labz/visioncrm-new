import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  reference: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  image_url: z.string().url().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/catalog/[id]
 * Get a single catalog item
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(
  req: Request,
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

    if (!hasPermission(role, 'view_catalog')) {
      throw ApiErrors.Forbidden('Permission requise: view_catalog');
    }

    const item = await prisma.catalogItem.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!item) {
      throw ApiErrors.NotFound('Produit');
    }

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/catalog/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/catalog/[id]
 * Update a catalog item
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function PATCH(
  req: Request,
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

    if (!hasPermission(role, 'edit_catalog')) {
      throw ApiErrors.Forbidden('Permission requise: edit_catalog');
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.catalogItem.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Produit');
    }

    if (data.reference && data.reference !== existing.reference) {
      const duplicate = await prisma.catalogItem.findFirst({
        where: {
          tenant_id: tenantId,
          reference: data.reference,
          deleted_at: null,
          NOT: { id: id },
        },
      });

      if (duplicate) {
        throw ApiErrors.BadRequest('Un produit avec cette référence existe déjà');
      }
    }

    const item = await prisma.catalogItem.update({
      where: { id: id },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/catalog/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/catalog/[id]
 * Soft delete a catalog item
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function DELETE(
  req: Request,
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

    if (!hasPermission(role, 'edit_catalog')) {
      throw ApiErrors.Forbidden('Permission requise: edit_catalog');
    }

    const existing = await prisma.catalogItem.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Produit');
    }

    await prisma.catalogItem.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/catalog/${id}`,
      method: 'DELETE',
    });
  }
}

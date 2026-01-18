import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const vatRateUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  rate: z.number().min(0).max(100).optional(),
  country: z.string().length(2).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

/**
 * PATCH /api/settings/vat-rates/:id
 * Update VAT rate
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
    const data = vatRateUpdateSchema.parse(body);

    const existing = await prisma.vatRate.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Taux de TVA');
    }

    // If setting as default, unset other defaults
    if (data.is_default) {
      await prisma.vatRate.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const vatRate = await prisma.vatRate.update({
      where: { id },
      data,
    });

    return NextResponse.json(vatRate);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/vat-rates/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/settings/vat-rates/:id
 * Delete VAT rate
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

    const existing = await prisma.vatRate.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Taux de TVA');
    }

    // Prevent deletion of default rate
    if (existing.is_default) {
      throw ApiErrors.BadRequest('Impossible de supprimer le taux de TVA par défaut');
    }

    await prisma.vatRate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/vat-rates/${id}`,
      method: 'DELETE',
    });
  }
}

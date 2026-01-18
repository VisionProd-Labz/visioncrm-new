import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const paymentMethodUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

/**
 * PATCH /api/settings/payment-methods/:id
 * Update payment method
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
    const data = paymentMethodUpdateSchema.parse(body);

    const existing = await prisma.customPaymentMethod.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Moyen de paiement');
    }

    // If setting as default, unset other defaults
    if (data.is_default) {
      await prisma.customPaymentMethod.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const method = await prisma.customPaymentMethod.update({
      where: { id },
      data,
    });

    return NextResponse.json(method);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/payment-methods/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/settings/payment-methods/:id
 * Delete payment method
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

    const existing = await prisma.customPaymentMethod.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Moyen de paiement');
    }

    // Prevent deletion of default method
    if (existing.is_default) {
      throw ApiErrors.BadRequest('Impossible de supprimer le moyen de paiement par défaut');
    }

    await prisma.customPaymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/payment-methods/${id}`,
      method: 'DELETE',
    });
  }
}

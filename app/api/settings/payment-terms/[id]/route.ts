import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const paymentTermUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  days: z.number().int().min(0).optional(),
  type: z.enum(['NET', 'EOM']).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

/**
 * PATCH /api/settings/payment-terms/:id
 * Update payment term
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
    const data = paymentTermUpdateSchema.parse(body);

    const existing = await prisma.paymentTerm.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Condition de paiement');
    }

    // If setting as default, unset other defaults
    if (data.is_default) {
      await prisma.paymentTerm.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const term = await prisma.paymentTerm.update({
      where: { id },
      data,
    });

    return NextResponse.json(term);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/payment-terms/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/settings/payment-terms/:id
 * Delete payment term
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

    const existing = await prisma.paymentTerm.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Condition de paiement');
    }

    // Prevent deletion of default term
    if (existing.is_default) {
      throw ApiErrors.BadRequest('Impossible de supprimer la condition de paiement par défaut');
    }

    await prisma.paymentTerm.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/settings/payment-terms/${id}`,
      method: 'DELETE',
    });
  }
}

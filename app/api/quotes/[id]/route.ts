import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { calculateTotals } from '@/lib/utils/invoice-calculations';

/**
 * GET /api/quotes/:id
 * Get a single quote
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

    if (!hasPermission(role, 'view_quotes')) {
      throw ApiErrors.Forbidden('Permission requise: view_quotes');
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id,
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
            phone: true,
            company: true,
            address: true,
          },
        },
        invoice: true,
      },
    });

    if (!quote) {
      throw ApiErrors.NotFound('Devis');
    }

    return NextResponse.json(quote);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/quotes/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/quotes/:id
 * Update a quote
 *
 * ✅ REFACTORED: Using centralized error handler + shared utilities
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

    if (!hasPermission(role, 'edit_quotes')) {
      throw ApiErrors.Forbidden('Permission requise: edit_quotes');
    }

    const body = await req.json();

    const existing = await prisma.quote.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Devis');
    }

    const updateData: any = {};

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.valid_until) updateData.valid_until = new Date(body.valid_until);

    // Recalculate totals if items changed using shared utility
    if (body.items) {
      updateData.items = body.items;
      const totals = calculateTotals(body.items);
      Object.assign(updateData, totals);
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/quotes/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/quotes/:id
 * Soft delete a quote
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

    if (!hasPermission(role, 'delete_quotes')) {
      throw ApiErrors.Forbidden('Permission requise: delete_quotes');
    }

    const existing = await prisma.quote.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Devis');
    }

    await prisma.quote.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Devis supprimé' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/quotes/${id}`,
      method: 'DELETE',
    });
  }
}

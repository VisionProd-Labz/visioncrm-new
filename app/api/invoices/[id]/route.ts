import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { calculateTotals } from '@/lib/utils/invoice-calculations';

/**
 * GET /api/invoices/:id
 * Get a single invoice
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

    if (!hasPermission(role, 'view_invoices')) {
      throw ApiErrors.Forbidden('Permission requise: view_invoices');
    }

    const invoice = await prisma.invoice.findFirst({
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
        quote: true,
      },
    });

    if (!invoice) {
      throw ApiErrors.NotFound('Facture');
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/invoices/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/invoices/:id
 * Update an invoice
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

    if (!hasPermission(role, 'edit_invoices')) {
      throw ApiErrors.Forbidden('Permission requise: edit_invoices');
    }

    const body = await req.json();

    const existing = await prisma.invoice.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Facture');
    }

    const updateData: any = {};

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.due_date) updateData.due_date = new Date(body.due_date);
    if (body.payment_method) updateData.payment_method = body.payment_method;
    if (body.siret) updateData.siret = body.siret;
    if (body.tva_number) updateData.tva_number = body.tva_number;

    // Mark as paid if status is PAID
    if (body.status === 'PAID' && !existing.paid_at) {
      updateData.paid_at = new Date();
    }

    // Recalculate totals if items changed using shared utility
    if (body.items) {
      updateData.items = body.items;
      const totals = calculateTotals(body.items);
      Object.assign(updateData, totals);
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        quote: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/invoices/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/invoices/:id
 * Soft delete an invoice
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

    if (!hasPermission(role, 'delete_invoices')) {
      throw ApiErrors.Forbidden('Permission requise: delete_invoices');
    }

    const existing = await prisma.invoice.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Facture');
    }

    await prisma.invoice.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Facture supprimée' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/invoices/${id}`,
      method: 'DELETE',
    });
  }
}

import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

/**
 * GET /api/quotes/:id
 * Get a single quote
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await requireTenantId();

    const quote = await prisma.quote.findFirst({
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
            phone: true,
            company: true,
            address: true,
          },
        },
        invoice: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quotes/:id
 * Update a quote
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await requireTenantId();
    const body = await req.json();

    // Check quote exists
    const existing = await prisma.quote.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Update quote
    const updateData: any = {};

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.valid_until) updateData.valid_until = new Date(body.valid_until);

    // Recalculate totals if items changed
    if (body.items) {
      updateData.items = body.items;

      const subtotal = body.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      const vatRate = body.items[0]?.vat_rate || 20;
      const vatAmount = (subtotal * vatRate) / 100;
      const total = subtotal + vatAmount;

      updateData.subtotal = Number(subtotal.toFixed(2));
      updateData.vat_rate = vatRate;
      updateData.vat_amount = Number(vatAmount.toFixed(2));
      updateData.total = Number(total.toFixed(2));
    }

    const quote = await prisma.quote.update({
      where: { id: id },
      data: updateData,
      include: {
        contact: true,
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Update quote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quotes/:id
 * Soft delete a quote
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await requireTenantId();

    // Check quote exists
    const existing = await prisma.quote.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.quote.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Devis supprimé' });
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

const paymentTermUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  days: z.number().int().min(0).optional(),
  type: z.enum(['NET', 'EOM']).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// PATCH /api/settings/payment-terms/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = paymentTermUpdateSchema.parse(body);

    // Verify ownership
    const existing = await prisma.paymentTerm.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Condition de paiement non trouvée' }, { status: 404 });
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
      where: { id: id },
      data,
    });

    return NextResponse.json(term);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error updating payment term:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la condition de paiement' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/payment-terms/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.paymentTerm.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Condition de paiement non trouvée' }, { status: 404 });
    }

    // Prevent deletion of default term
    if (existing.is_default) {
      return NextResponse.json(
        { error: 'Impossible de supprimer la condition de paiement par défaut' },
        { status: 400 }
      );
    }

    await prisma.paymentTerm.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment term:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la condition de paiement' },
      { status: 500 }
    );
  }
}

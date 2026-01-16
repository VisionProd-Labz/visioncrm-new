import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

const paymentMethodSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

// GET /api/settings/payment-methods
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_settings');
    if (permError) return permError;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const methods = await prisma.customPaymentMethod.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des moyens de paiement' },
      { status: 500 }
    );
  }
}

// POST /api/settings/payment-methods
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await requireTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const body = await req.json();
    const data = paymentMethodSchema.parse(body);

    // If this is set as default, unset other defaults
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

    const method = await prisma.customPaymentMethod.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du moyen de paiement' },
      { status: 500 }
    );
  }
}

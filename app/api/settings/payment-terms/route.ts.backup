import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';

const paymentTermSchema = z.object({
  name: z.string().min(1).max(100),
  days: z.number().min(0),
  type: z.enum(['NET', 'EOM']), // NET = jours nets, EOM = fin de mois
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// GET /api/settings/payment-terms
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const terms = await prisma.paymentTerm.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: [
        { days: 'asc' },
      ],
    });

    return NextResponse.json({ terms });
  } catch (error) {
    console.error('Error fetching payment terms:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conditions de paiement' },
      { status: 500 }
    );
  }
}

// POST /api/settings/payment-terms
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    const body = await req.json();
    const data = paymentTermSchema.parse(body);

    // If this is set as default, unset other defaults
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

    const term = await prisma.paymentTerm.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(term, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error creating payment term:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la condition de paiement' },
      { status: 500 }
    );
  }
}

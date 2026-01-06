import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';

const companySchema = z.object({
  company_name: z.string().min(1).max(255).optional(),
  company_siret: z.string().max(14).optional(),
  company_tva: z.string().max(50).optional(),
  company_address: z.any().optional(),
  company_logo: z.string().url().optional(),
  company_info: z.any().optional(),
});

/**
 * GET /api/company
 * Get company information
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        company_name: true,
        company_siret: true,
        company_tva: true,
        company_address: true,
        company_logo: true,
        company_info: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Société non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/company
 * Update company information
 */
export async function PATCH(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = companySchema.parse(body);

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
      select: {
        id: true,
        name: true,
        company_name: true,
        company_siret: true,
        company_tva: true,
        company_address: true,
        company_logo: true,
        company_info: true,
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations' },
      { status: 500 }
    );
  }
}

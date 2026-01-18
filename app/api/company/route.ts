import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
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
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_company')) {
      throw ApiErrors.Forbidden('Permission requise: view_company');
    }

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
      throw ApiErrors.NotFound('Société');
    }

    return NextResponse.json(tenant);
  } catch (error) {
    return handleApiError(error, {
      route: '/api/company',
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/company
 * Update company information
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'edit_company')) {
      throw ApiErrors.Forbidden('Permission requise: edit_company');
    }

    const body = await req.json();
    const data = companySchema.parse(body);

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
    return handleApiError(error, {
      route: '/api/company',
      method: 'PATCH',
    });
  }
}

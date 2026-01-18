import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const vatRateSchema = z.object({
  name: z.string().min(1).max(100),
  rate: z.number().min(0).max(100),
  country: z.string().length(2).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/settings/vat-rates
 * List VAT rates
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

    if (!hasPermission(role, 'view_settings')) {
      throw ApiErrors.Forbidden('Permission requise: view_settings');
    }

    const rates = await prisma.vatRate.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: [
        { is_default: 'desc' },
        { rate: 'desc' },
      ],
    });

    return NextResponse.json({ rates });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/vat-rates',
      method: 'GET',
    });
  }
}

/**
 * POST /api/settings/vat-rates
 * Create VAT rate
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function POST(req: Request) {
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
    const data = vatRateSchema.parse(body);

    // If this is set as default, unset other defaults
    if (data.is_default) {
      await prisma.vatRate.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const rate = await prisma.vatRate.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/vat-rates',
      method: 'POST',
    });
  }
}

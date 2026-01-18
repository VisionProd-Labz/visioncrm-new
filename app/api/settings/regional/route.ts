import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const regionalSettingsSchema = z.object({
  date_format: z.string().optional(),
  number_format: z.object({
    decimal_separator: z.string(),
    thousand_separator: z.string(),
    decimals: z.number().int().min(0).max(4),
  }).optional(),
  currency_display: z.enum(['before', 'after']).optional(),
  phone_clickable: z.boolean().optional(),
});

/**
 * GET /api/settings/regional
 * Get regional settings
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        date_format: true,
        number_format: true,
        currency_display: true,
        phone_clickable: true,
      },
    });

    if (!tenant) {
      throw ApiErrors.NotFound('Tenant');
    }

    return NextResponse.json({ settings: tenant });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/regional',
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/settings/regional
 * Update regional settings
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

    if (!hasPermission(role, 'edit_settings')) {
      throw ApiErrors.Forbidden('Permission requise: edit_settings');
    }

    const body = await req.json();
    const data = regionalSettingsSchema.parse(body);

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
      select: {
        date_format: true,
        number_format: true,
        currency_display: true,
        phone_clickable: true,
      },
    });

    return NextResponse.json({ settings: tenant });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/regional',
      method: 'PATCH',
    });
  }
}

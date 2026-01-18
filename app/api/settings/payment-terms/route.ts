import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const paymentTermSchema = z.object({
  name: z.string().min(1).max(100),
  days: z.number().min(0),
  type: z.enum(['NET', 'EOM']), // NET = jours nets, EOM = fin de mois
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/settings/payment-terms
 * List payment terms
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
    return handleApiError(error, {
      route: '/api/settings/payment-terms',
      method: 'GET',
    });
  }
}

/**
 * POST /api/settings/payment-terms
 * Create payment term
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
    return handleApiError(error, {
      route: '/api/settings/payment-terms',
      method: 'POST',
    });
  }
}

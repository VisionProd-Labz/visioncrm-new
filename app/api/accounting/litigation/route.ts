import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { litigationSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/litigation
 * List all litigation cases for the current tenant
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_litigation')) {
      throw ApiErrors.Forbidden('Permission requise: view_litigation');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (status) where.status = status;
    if (type) where.type = type;

    const cases = await prisma.litigation.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const stats = {
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'ONGOING').length,
      settledCases: cases.filter(c => c.status === 'SETTLED' || c.status === 'WON' || c.status === 'CLOSED').length,
      totalAmountDisputed: cases.reduce((sum, c) => sum + Number(c.amount_disputed || 0), 0),
    };

    return NextResponse.json({ cases, stats });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/litigation',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/litigation
 * Create a new litigation case
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'create_litigation')) {
      throw ApiErrors.Forbidden('Permission requise: create_litigation');
    }

    const body = await req.json();
    const data = litigationSchema.parse(body);

    const { metadata, ...rest } = data;
    const litigationCase = await prisma.litigation.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        ...(metadata && { metadata }),
      },
    });

    return NextResponse.json(litigationCase, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/litigation',
      method: 'POST',
    });
  }
}

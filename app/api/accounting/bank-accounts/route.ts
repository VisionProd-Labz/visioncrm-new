import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { bankAccountSchema } from '@/lib/accounting/validations';

// Force dynamic rendering - no static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/accounting/bank-accounts
 * Get all bank accounts for current tenant
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

    if (!hasPermission(role, 'view_bank_accounts')) {
      throw ApiErrors.Forbidden('Permission requise: view_bank_accounts');
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');

    const accounts = await prisma.bankAccount.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        ...(isActive !== null && { is_active: isActive === 'true' }),
      },
      include: {
        _count: {
          select: {
            transactions: true,
            reconciliations: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/bank-accounts',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/bank-accounts
 * Create a new bank account
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

    if (!hasPermission(role, 'create_bank_accounts')) {
      throw ApiErrors.Forbidden('Permission requise: create_bank_accounts');
    }

    const body = await req.json();
    const data = bankAccountSchema.parse(body);

    const existing = await prisma.bankAccount.findFirst({
      where: {
        tenant_id: tenantId,
        account_number: data.account_number,
        deleted_at: null,
      },
    });

    if (existing) {
      throw ApiErrors.BadRequest('Un compte avec ce numéro existe déjà');
    }

    const account = await prisma.bankAccount.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            reconciliations: true,
          },
        },
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/bank-accounts',
      method: 'POST',
    });
  }
}

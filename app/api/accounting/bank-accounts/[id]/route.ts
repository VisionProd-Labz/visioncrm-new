import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

// Force dynamic rendering - no static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/accounting/bank-accounts/[id]
 * Get a specific bank account
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    const account = await prisma.bankAccount.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            reconciliations: true,
          },
        },
        reconciliations: {
          take: 5,
          orderBy: { reconciliation_date: 'desc' },
        },
      },
    });

    if (!account) {
      throw ApiErrors.NotFound('Compte');
    }

    return NextResponse.json({ account });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/bank-accounts/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/accounting/bank-accounts/[id]
 * Update a bank account
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'edit_bank_accounts')) {
      throw ApiErrors.Forbidden('Permission requise: edit_bank_accounts');
    }

    const body = await req.json();
    const data = body;

    const existing = await prisma.bankAccount.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Compte');
    }

    if (data.account_number && data.account_number !== existing.account_number) {
      const duplicate = await prisma.bankAccount.findFirst({
        where: {
          tenant_id: tenantId,
          account_number: data.account_number,
          deleted_at: null,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw ApiErrors.BadRequest('Un compte avec ce numéro existe déjà');
      }
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            transactions: true,
            reconciliations: true,
          },
        },
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/bank-accounts/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/accounting/bank-accounts/[id]
 * Soft delete a bank account
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'delete_bank_accounts')) {
      throw ApiErrors.Forbidden('Permission requise: delete_bank_accounts');
    }

    const existing = await prisma.bankAccount.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            transactions: { where: { status: 'PENDING' } },
          },
        },
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Compte');
    }

    if (existing._count.transactions > 0) {
      throw ApiErrors.BadRequest('Impossible de supprimer un compte avec des transactions en attente');
    }

    await prisma.bankAccount.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/bank-accounts/${id}`,
      method: 'DELETE',
    });
  }
}

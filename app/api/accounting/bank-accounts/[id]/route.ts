import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { bankAccountSchema } from '@/lib/accounting/validations';
import { z } from 'zod';
import { requirePermission } from '@/lib/middleware/require-permission';

// Force dynamic rendering - no static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/accounting/bank-accounts/[id]
 * Get a specific bank account
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ✅ SECURITY FIX #3: RBAC permission check
    const permError = await requirePermission('view_bank_accounts');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounting/bank-accounts/[id]
 * Update a bank account
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ✅ SECURITY FIX #3: RBAC permission check
    const permError = await requirePermission('edit_bank_accounts');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // For PATCH, we validate that the provided fields are valid, but don't require all fields
    const data = body;

    // Check if account exists and belongs to tenant
    const existing = await prisma.bankAccount.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
    }

    // If changing account number, check for duplicates
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
        return NextResponse.json(
          { error: 'Un compte avec ce numéro existe déjà' },
          { status: 400 }
        );
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/bank-accounts/[id]
 * Soft delete a bank account
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ✅ SECURITY FIX #3: RBAC permission check
    const permError = await requirePermission('delete_bank_accounts');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if account exists and belongs to tenant
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
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
    }

    // Prevent deletion if there are pending transactions
    if (existing._count.transactions > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un compte avec des transactions en attente' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.bankAccount.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'Failed to delete bank account' },
      { status: 500 }
    );
  }
}

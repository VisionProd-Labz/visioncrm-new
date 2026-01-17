import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { requirePermission } from '@/lib/middleware/require-permission';

/**
 * POST /api/accounting/expenses/[id]/approve
 * Approve an expense
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ✅ SECURITY FIX #3: RBAC permission check
    const permError = await requirePermission('approve_expenses');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if expense exists and belongs to tenant
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dépense introuvable' }, { status: 404 });
    }

    // Check if already approved or paid
    if (existing.status === 'APPROVED' || existing.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cette dépense est déjà approuvée ou payée' },
        { status: 400 }
      );
    }

    // Approve the expense
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_by: session.user.id,
        approved_at: new Date(),
      },
      include: {
        vendor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error approving expense:', error);
    return NextResponse.json(
      { error: 'Failed to approve expense' },
      { status: 500 }
    );
  }
}

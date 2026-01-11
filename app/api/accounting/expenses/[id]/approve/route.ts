import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getServerSession(authOptions);
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

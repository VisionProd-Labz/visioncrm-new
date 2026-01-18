import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * POST /api/accounting/expenses/[id]/approve
 * Approve an expense
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function POST(
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

    if (!hasPermission(role, 'approve_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: approve_expenses');
    }

    const existing = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Dépense');
    }

    if (existing.status === 'APPROVED' || existing.status === 'PAID') {
      throw ApiErrors.BadRequest('Cette dépense est déjà approuvée ou payée');
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_by: user.id,
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
    return handleApiError(error, {
      route: `/api/accounting/expenses/${id}/approve`,
      method: 'POST',
    });
  }
}

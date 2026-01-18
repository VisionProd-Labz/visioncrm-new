import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/accounting/expenses/:id
 * Get a specific expense
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

    if (!hasPermission(role, 'view_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: view_expenses');
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        vendor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!expense) {
      throw ApiErrors.NotFound('Dépense');
    }

    return NextResponse.json({ expense });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/expenses/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/accounting/expenses/:id
 * Update an expense
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

    if (!hasPermission(role, 'edit_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: edit_expenses');
    }

    const body = await req.json();
    const data = body;

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

    // Prevent editing if already approved or paid
    if (existing.status === 'APPROVED' || existing.status === 'PAID') {
      throw ApiErrors.BadRequest('Impossible de modifier une dépense approuvée ou payée');
    }

    // Verify vendor if provided
    if (data.vendor_id) {
      const vendor = await prisma.contact.findFirst({
        where: {
          id: data.vendor_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!vendor) {
        throw ApiErrors.NotFound('Fournisseur');
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
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
      route: `/api/accounting/expenses/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/accounting/expenses/:id
 * Soft delete an expense
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

    if (!hasPermission(role, 'delete_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: delete_expenses');
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

    // Prevent deletion if already paid
    if (existing.status === 'PAID') {
      throw ApiErrors.BadRequest('Impossible de supprimer une dépense déjà payée');
    }

    await prisma.expense.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/accounting/expenses/${id}`,
      method: 'DELETE',
    });
  }
}

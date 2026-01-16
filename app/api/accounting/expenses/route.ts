import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { expenseSchema } from '@/lib/accounting/validations';
import { z } from 'zod';
import { requirePermission } from '@/lib/middleware/require-permission';

/**
 * GET /api/accounting/expenses
 * Get expenses with filters
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_expenses');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendor_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (status) where.status = status;
    if (category) where.category = category;
    if (vendorId) where.vendor_id = vendorId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
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
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/expenses
 * Create a new expense
 */
export async function POST(req: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = expenseSchema.parse(body);

    // Verify vendor belongs to tenant if provided
    if (data.vendor_id) {
      const vendor = await prisma.contact.findFirst({
        where: {
          id: data.vendor_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!vendor) {
        return NextResponse.json(
          { error: 'Fournisseur introuvable' },
          { status: 404 }
        );
      }
    }

    // Generate expense number
    const count = await prisma.expense.count({
      where: { tenant_id: tenantId },
    });
    const expense_number = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const { metadata, ...rest } = data;
    const expense = await prisma.expense.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        expense_number,
        date: new Date(data.date),
        ...(metadata && { metadata }),
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

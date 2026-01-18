import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { expenseSchema } from '@/lib/accounting/validations';
import { generateDocumentNumber } from '@/lib/utils/document-numbers';

/**
 * GET /api/accounting/expenses
 * Get expenses with filters
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

    if (!hasPermission(role, 'view_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: view_expenses');
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
    return handleApiError(error, {
      route: '/api/accounting/expenses',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/expenses
 * Create a new expense
 *
 * ✅ REFACTORED: Using centralized error handler + shared utilities
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

    if (!hasPermission(role, 'create_expenses')) {
      throw ApiErrors.Forbidden('Permission requise: create_expenses');
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
        throw ApiErrors.NotFound('Fournisseur');
      }
    }

    // Generate expense number using shared utility
    const expense_number = await generateDocumentNumber(tenantId, 'expense');

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
    return handleApiError(error, {
      route: '/api/accounting/expenses',
      method: 'POST',
    });
  }
}

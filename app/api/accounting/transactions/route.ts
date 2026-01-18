import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { bankTransactionSchema, bulkTransactionImportSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/transactions
 * Get bank transactions with filters
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

    if (!hasPermission(role, 'view_bank_transactions')) {
      throw ApiErrors.Forbidden('Permission requise: view_bank_transactions');
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      tenant_id: tenantId,
    };

    if (accountId) where.account_id = accountId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        include: {
          account: {
            select: {
              account_name: true,
              bank_name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.bankTransaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/transactions',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/transactions
 * Create a new transaction or bulk import
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

    if (!hasPermission(role, 'create_bank_transactions')) {
      throw ApiErrors.Forbidden('Permission requise: create_bank_transactions');
    }

    const body = await req.json();

    if (body.transactions && Array.isArray(body.transactions)) {
      return handleBulkImport(tenantId, body);
    }

    const data = bankTransactionSchema.parse(body);

    const account = await prisma.bankAccount.findFirst({
      where: {
        id: data.account_id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!account) {
      throw ApiErrors.NotFound('Compte bancaire');
    }

    const { metadata, ...rest } = data;
    const transaction = await prisma.bankTransaction.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        ...(metadata && { metadata }),
      },
      include: {
        account: {
          select: {
            account_name: true,
            bank_name: true,
          },
        },
      },
    });

    const balanceChange = data.type === 'CREDIT' ? data.amount : -data.amount;
    await prisma.bankAccount.update({
      where: { id: data.account_id },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/transactions',
      method: 'POST',
    });
  }
}

/**
 * Handle bulk transaction import
 */
async function handleBulkImport(tenantId: string, body: any) {
  try {
    const data = bulkTransactionImportSchema.parse(body);

    const account = await prisma.bankAccount.findFirst({
      where: {
        id: data.account_id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!account) {
      throw ApiErrors.NotFound('Compte bancaire');
    }

    const transactions = await prisma.$transaction(
      data.transactions.map((t) =>
        prisma.bankTransaction.create({
          data: {
            tenant_id: tenantId,
            account_id: data.account_id,
            date: new Date(t.date),
            amount: t.amount,
            type: t.type,
            description: t.description,
            reference: t.reference,
            status: 'PENDING',
          },
        })
      )
    );

    const balanceChange = data.transactions.reduce((sum, t) => {
      return sum + (t.type === 'CREDIT' ? t.amount : -t.amount);
    }, 0);

    await prisma.bankAccount.update({
      where: { id: data.account_id },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    return NextResponse.json({
      success: true,
      imported: transactions.length,
      transactions,
    }, { status: 201 });
  } catch (error) {
    throw error;
  }
}

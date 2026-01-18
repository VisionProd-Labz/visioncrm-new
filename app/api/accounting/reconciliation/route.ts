import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { bankReconciliationSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/reconciliation
 * Get bank reconciliations
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
    const accountId = searchParams.get('account_id');
    const status = searchParams.get('status');

    const where: any = {
      tenant_id: tenantId,
    };

    if (accountId) where.account_id = accountId;
    if (status) where.status = status;

    const reconciliations = await prisma.bankReconciliation.findMany({
      where,
      include: {
        account: {
          select: {
            account_name: true,
            bank_name: true,
            account_number: true,
          },
        },
      },
      orderBy: { reconciliation_date: 'desc' },
    });

    return NextResponse.json({ reconciliations });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/reconciliation',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/reconciliation
 * Create a new bank reconciliation
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
    const data = bankReconciliationSchema.parse(body);

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

    const transactions = await prisma.bankTransaction.findMany({
      where: {
        tenant_id: tenantId,
        account_id: data.account_id,
        status: 'PENDING',
        date: {
          lte: new Date(data.reconciliation_date),
        },
      },
    });

    const systemBalance = transactions.reduce((sum, t) => {
      return sum + (t.type === 'CREDIT' ? Number(t.amount) : -Number(t.amount));
    }, Number(account.balance));

    const difference = data.statement_balance - systemBalance;
    const status = Math.abs(difference) < 0.01 ? 'COMPLETED' : 'NEEDS_REVIEW';

    const reconciliation = await prisma.bankReconciliation.create({
      data: {
        tenant_id: tenantId,
        account_id: data.account_id,
        reconciliation_date: new Date(data.reconciliation_date),
        statement_balance: data.statement_balance,
        system_balance: systemBalance,
        difference,
        status,
        notes: data.notes,
        document_url: data.document_url,
        reconciled_by: user.id,
        completed_at: status === 'COMPLETED' ? new Date() : null,
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

    if (status === 'COMPLETED') {
      await prisma.bankTransaction.updateMany({
        where: {
          tenant_id: tenantId,
          account_id: data.account_id,
          status: 'PENDING',
          date: {
            lte: new Date(data.reconciliation_date),
          },
        },
        data: {
          status: 'RECONCILED',
          reconciled_at: new Date(),
        },
      });

      await prisma.bankAccount.update({
        where: { id: data.account_id },
        data: { last_reconciled_at: new Date() },
      });
    }

    return NextResponse.json(reconciliation, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/reconciliation',
      method: 'POST',
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { requirePermission } from '@/lib/middleware/require-permission';

// Utility function to get current tenant ID

/**
 * GET /api/accounting/reports
 * List all financial reports for the current tenant
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_financial_reports');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    const { searchParams } = new URL(req.url);

    const year = searchParams.get('year');
    const type = searchParams.get('type');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (year) where.year = parseInt(year);
    if (type) where.report_type = type;

    const reports = await prisma.financialReport.findMany({
      where,
      orderBy: [{ year: 'desc' }, { period: 'desc' }],
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/reports
 * Create/generate a new financial report
 */
export async function POST(req: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const session = await auth();
    const body = await req.json();

    const { report_type, year, period } = body;

    // Validate required fields
    if (!report_type || !year || !period) {
      return NextResponse.json(
        { error: 'Type de rapport, année et période requis' },
        { status: 400 }
      );
    }

    // Generate report data based on type
    const reportData = await generateReportData(tenantId, report_type, year, period);

    // Create report record
    const { metadata, ...rest } = reportData;
    const report = await prisma.financialReport.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        year,
        period,
        ...(metadata && { metadata }),
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating financial report:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du rapport' },
      { status: 500 }
    );
  }
}

/**
 * Generate report data based on type
 */
async function generateReportData(
  tenantId: string,
  reportType: string,
  year: number,
  period: string
): Promise<any> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  switch (reportType) {
    case 'BALANCE_SHEET':
      return await generateBalanceSheet(tenantId, startDate, endDate);

    case 'INCOME_STATEMENT':
      return await generateIncomeStatement(tenantId, startDate, endDate);

    case 'CASH_FLOW':
      return await generateCashFlow(tenantId, startDate, endDate);

    case 'VAT_SUMMARY':
      return await generateVATSummary(tenantId, startDate, endDate);

    case 'FEC_EXPORT':
      return await generateFECExport(tenantId, startDate, endDate);

    default:
      throw new Error('Type de rapport non supporté');
  }
}

/**
 * Generate Balance Sheet (Bilan)
 */
async function generateBalanceSheet(tenantId: string, startDate: Date, endDate: Date) {
  const [bankAccounts, inventory, expenses] = await Promise.all([
    prisma.bankAccount.findMany({
      where: { tenant_id: tenantId, deleted_at: null },
    }),
    prisma.inventoryItem.findMany({
      where: { tenant_id: tenantId, deleted_at: null },
    }),
    prisma.expense.findMany({
      where: {
        tenant_id: tenantId,
        date: { gte: startDate, lte: endDate },
        status: 'PAID',
        deleted_at: null,
      },
    }),
  ]);

  const totalCash = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalInventory = inventory.reduce((sum, item) => sum + Number(item.total_value), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount_ttc), 0);

  return {
    assets: {
      current_assets: {
        cash: totalCash,
        inventory: totalInventory,
        total: totalCash + totalInventory,
      },
    },
    liabilities: {
      total_expenses: totalExpenses,
    },
    summary: {
      total_assets: totalCash + totalInventory,
      total_liabilities: totalExpenses,
    },
  };
}

/**
 * Generate Income Statement (Compte de résultat)
 */
async function generateIncomeStatement(tenantId: string, startDate: Date, endDate: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      tenant_id: tenantId,
      date: { gte: startDate, lte: endDate },
      status: 'PAID',
      deleted_at: null,
    },
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount_ttc), 0);
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category;
    acc[cat] = (acc[cat] || 0) + Number(exp.amount_ttc);
    return acc;
  }, {} as Record<string, number>);

  return {
    period: { start: startDate, end: endDate },
    expenses: {
      by_category: expensesByCategory,
      total: totalExpenses,
    },
    // TODO: Add revenue once invoicing module is integrated
    revenue: {
      total: 0,
    },
    net_income: -totalExpenses,
  };
}

/**
 * Generate Cash Flow Statement
 */
async function generateCashFlow(tenantId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.bankTransaction.findMany({
    where: {
      tenant_id: tenantId,
      date: { gte: startDate, lte: endDate },
    },
  });

  const cashIn = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const cashOut = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    period: { start: startDate, end: endDate },
    operating_activities: {
      cash_in: cashIn,
      cash_out: cashOut,
      net_cash: cashIn - cashOut,
    },
  };
}

/**
 * Generate VAT Summary
 */
async function generateVATSummary(tenantId: string, startDate: Date, endDate: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      tenant_id: tenantId,
      date: { gte: startDate, lte: endDate },
      deleted_at: null,
    },
  });

  const totalVAT = expenses.reduce((sum, exp) => sum + Number(exp.vat_amount), 0);
  const vatByRate = expenses.reduce((acc, exp) => {
    const rate = Number(exp.vat_rate);
    if (!acc[rate]) {
      acc[rate] = { ht: 0, vat: 0, ttc: 0 };
    }
    acc[rate].ht += Number(exp.amount_ht);
    acc[rate].vat += Number(exp.vat_amount);
    acc[rate].ttc += Number(exp.amount_ttc);
    return acc;
  }, {} as Record<number, { ht: number; vat: number; ttc: number }>);

  return {
    period: { start: startDate, end: endDate },
    vat_collected: 0, // TODO: From invoices
    vat_paid: totalVAT,
    vat_to_pay: -totalVAT,
    by_rate: vatByRate,
  };
}

/**
 * Generate FEC Export (Fichier des Écritures Comptables)
 */
async function generateFECExport(tenantId: string, startDate: Date, endDate: Date) {
  // FEC format requires specific columns
  // This is a simplified version
  const expenses = await prisma.expense.findMany({
    where: {
      tenant_id: tenantId,
      date: { gte: startDate, lte: endDate },
      deleted_at: null,
    },
  });

  const entries = expenses.map(exp => ({
    JournalCode: 'ACH',
    JournalLib: 'Journal des achats',
    EcritureNum: exp.expense_number,
    EcritureDate: exp.date,
    CompteNum: '607', // Expense account
    CompteLib: 'Achats',
    CompAuxNum: exp.vendor_id || '',
    CompAuxLib: exp.vendor_name,
    PieceRef: exp.expense_number,
    PieceDate: exp.date,
    EcritureLib: exp.description,
    Debit: exp.amount_ht,
    Credit: 0,
    Montantdevise: exp.amount_ttc,
    Idevise: 'EUR',
  }));

  return {
    format: 'FEC',
    entries,
    total_entries: entries.length,
  };
}

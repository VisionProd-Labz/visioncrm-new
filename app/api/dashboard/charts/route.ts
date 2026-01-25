import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';

/**
 * GET /api/dashboard/charts
 * Get chart data for dashboard (revenue, quotes, vehicles)
 */
export async function GET(req: Request) {
  try {
    const permError = await requirePermission('view_dashboard');
    if (permError) return permError;

    const tenantId = await requireTenantId();

    // Get last 6 months
    const now = new Date();
    const months: { start: Date; end: Date; label: string }[] = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = start.toLocaleString('default', { month: 'short' });
      months.push({ start, end, label });
    }

    // Fetch revenue data per month
    const revenuePromises = months.map(async (month) => {
      const result = await prisma.invoice.aggregate({
        where: {
          tenant_id: tenantId,
          status: 'PAID',
          paid_at: { gte: month.start, lte: month.end },
          deleted_at: null,
        },
        _sum: { total: true },
      });
      return {
        month: month.label,
        revenue: Number(result._sum.total || 0),
      };
    });

    // Fetch quotes count per month
    const quotesPromises = months.map(async (month) => {
      const count = await prisma.quote.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: month.start, lte: month.end },
          deleted_at: null,
        },
      });
      return {
        month: month.label,
        quotes: count,
      };
    });

    // Fetch vehicle interventions (events) per month
    const vehiclePromises = months.map(async (month) => {
      const count = await prisma.event.count({
        where: {
          tenant_id: tenantId,
          start_date: { gte: month.start, lte: month.end },
          deleted_at: null,
        },
      });
      return {
        month: month.label,
        entretiens: count,
      };
    });

    const [revenueData, quotesData, vehicleData] = await Promise.all([
      Promise.all(revenuePromises),
      Promise.all(quotesPromises),
      Promise.all(vehiclePromises),
    ]);

    // Merge revenue and quotes data
    const salesPerformance = revenueData.map((r, i) => ({
      month: r.month,
      revenue: r.revenue,
      quotes: quotesData[i]?.quotes || 0,
    }));

    return NextResponse.json({
      salesPerformance,
      quoteEvolution: quotesData,
      vehicleInterventions: vehicleData,
    });
  } catch (error) {
    console.error('Get dashboard charts error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données des graphiques' },
      { status: 500 }
    );
  }
}

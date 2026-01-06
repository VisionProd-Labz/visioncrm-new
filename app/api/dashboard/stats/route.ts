import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      totalContacts,
      vipContacts,
      contactsLastMonth,
      contactsPreviousMonth,
      totalVehicles,
      vehiclesLastMonth,
      vehiclesPreviousMonth,
      totalQuotes,
      quotesLastMonth,
      quotesPreviousMonth,
      quotesAccepted,
      quotesPending,
      totalInvoices,
      invoicesLastMonth,
      invoicesPreviousMonth,
      invoicesPaid,
      invoicesOverdue,
      totalRevenue,
      revenueLastMonth,
      revenuePreviousMonth,
      totalTasks,
      tasksCompleted,
      tasksPending,
      tasksOverdue,
    ] = await Promise.all([
      // Contacts
      prisma.contact.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      prisma.contact.count({
        where: { tenant_id: tenantId, is_vip: true, deleted_at: null },
      }),
      prisma.contact.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.contact.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          deleted_at: null,
        },
      }),

      // Vehicles
      prisma.vehicle.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      prisma.vehicle.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.vehicle.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          deleted_at: null,
        },
      }),

      // Quotes
      prisma.quote.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      prisma.quote.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.quote.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.quote.count({
        where: {
          tenant_id: tenantId,
          status: 'ACCEPTED',
          deleted_at: null,
        },
      }),
      prisma.quote.count({
        where: {
          tenant_id: tenantId,
          status: { in: ['DRAFT', 'SENT'] },
          deleted_at: null,
        },
      }),

      // Invoices
      prisma.invoice.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      prisma.invoice.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.invoice.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          deleted_at: null,
        },
      }),
      prisma.invoice.count({
        where: {
          tenant_id: tenantId,
          status: 'PAID',
          deleted_at: null,
        },
      }),
      prisma.invoice.count({
        where: {
          tenant_id: tenantId,
          status: 'OVERDUE',
          deleted_at: null,
        },
      }),

      // Revenue
      prisma.invoice.aggregate({
        where: {
          tenant_id: tenantId,
          status: 'PAID',
          deleted_at: null,
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          tenant_id: tenantId,
          status: 'PAID',
          paid_at: { gte: thirtyDaysAgo },
          deleted_at: null,
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          tenant_id: tenantId,
          status: 'PAID',
          paid_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          deleted_at: null,
        },
        _sum: { total: true },
      }),

      // Tasks
      prisma.task.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      prisma.task.count({
        where: {
          tenant_id: tenantId,
          status: 'DONE',
          deleted_at: null,
        },
      }),
      prisma.task.count({
        where: {
          tenant_id: tenantId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          deleted_at: null,
        },
      }),
      prisma.task.count({
        where: {
          tenant_id: tenantId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          due_date: { lt: now },
          deleted_at: null,
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Build response
    const stats = {
      contacts: {
        total: totalContacts,
        vip: vipContacts,
        change: calculateChange(contactsLastMonth, contactsPreviousMonth),
      },
      vehicles: {
        total: totalVehicles,
        change: calculateChange(vehiclesLastMonth, vehiclesPreviousMonth),
      },
      quotes: {
        total: totalQuotes,
        accepted: quotesAccepted,
        pending: quotesPending,
        change: calculateChange(quotesLastMonth, quotesPreviousMonth),
      },
      invoices: {
        total: totalInvoices,
        paid: invoicesPaid,
        overdue: invoicesOverdue,
        change: calculateChange(invoicesLastMonth, invoicesPreviousMonth),
      },
      revenue: {
        total: Number(totalRevenue._sum.total || 0),
        lastMonth: Number(revenueLastMonth._sum.total || 0),
        change: calculateChange(
          Number(revenueLastMonth._sum.total || 0),
          Number(revenuePreviousMonth._sum.total || 0)
        ),
      },
      tasks: {
        total: totalTasks,
        completed: tasksCompleted,
        pending: tasksPending,
        overdue: tasksOverdue,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

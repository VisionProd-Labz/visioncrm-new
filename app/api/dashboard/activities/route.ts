import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';

export interface Activity {
  id: string;
  type: 'contact_added' | 'task_completed' | 'quote_accepted' | 'quote_sent' | 'invoice_paid' | 'system';
  userName: string;
  targetName: string;
  createdAt: Date;
}

/**
 * GET /api/dashboard/activities
 * Get recent activities for dashboard
 */
export async function GET(req: Request) {
  try {
    const permError = await requirePermission('view_dashboard');
    if (permError) return permError;

    const tenantId = await requireTenantId();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Fetch recent contacts created
    const recentContacts = await prisma.contact.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        created_at: true,
      },
    });

    // Fetch recent tasks completed
    const recentTasks = await prisma.task.findMany({
      where: {
        tenant_id: tenantId,
        status: 'DONE',
        deleted_at: null,
        ...(Object.keys(dateFilter).length > 0 && { updated_at: dateFilter }),
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        updated_at: true,
        assignee: {
          select: { name: true },
        },
      },
    });

    // Fetch recent quotes accepted
    const recentQuotes = await prisma.quote.findMany({
      where: {
        tenant_id: tenantId,
        status: 'ACCEPTED',
        deleted_at: null,
        ...(Object.keys(dateFilter).length > 0 && { updated_at: dateFilter }),
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        quote_number: true,
        updated_at: true,
        contact: {
          select: { first_name: true, last_name: true },
        },
      },
    });

    // Combine and sort activities
    const activities: Activity[] = [
      ...recentContacts.map((c) => ({
        id: `contact-${c.id}`,
        type: 'contact_added' as const,
        userName: '', // System or unknown
        targetName: `${c.first_name} ${c.last_name}`,
        createdAt: c.created_at,
      })),
      ...recentTasks.map((t) => ({
        id: `task-${t.id}`,
        type: 'task_completed' as const,
        userName: t.assignee?.name || '',
        targetName: t.title,
        createdAt: t.updated_at,
      })),
      ...recentQuotes.map((q) => ({
        id: `quote-${q.id}`,
        type: 'quote_accepted' as const,
        userName: q.contact ? `${q.contact.first_name} ${q.contact.last_name}` : '',
        targetName: q.quote_number,
        createdAt: q.updated_at,
      })),
    ];

    // Sort by date descending
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return limited activities
    const limitedActivities = activities.slice(0, limit);

    // Get total count for pagination
    const totalCount = activities.length;

    return NextResponse.json({
      activities: limitedActivities,
      total: totalCount,
      hasMore: totalCount > limit,
    });
  } catch (error) {
    console.error('Get dashboard activities error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des activités' },
      { status: 500 }
    );
  }
}

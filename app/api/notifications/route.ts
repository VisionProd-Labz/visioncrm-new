import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { requireTenantId } from '@/lib/tenant';

/**
 * GET /api/notifications
 * Get user notifications
 * For now returns empty array - will be populated when notification system is implemented
 */
export async function GET(req: Request) {
  try {
    const permError = await requirePermission('view_dashboard');
    if (permError) return permError;

    const tenantId = await requireTenantId();

    // For now, return empty notifications
    // In the future, this will fetch from a notifications table
    return NextResponse.json({
      notifications: [],
      total: 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  all_day: z.boolean().optional(),
  type: z.enum(['MAINTENANCE', 'REPAIR', 'MEETING', 'CALL', 'SITE_VISIT', 'OTHER']).optional(),
  status: z.string().max(50).optional(),
  contact_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  location: z.string().max(255).optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/planning/events
 * List events with filters
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const { searchParams } = new URL(req.url);

    const start = searchParams.get('start'); // ISO date
    const end = searchParams.get('end'); // ISO date
    const type = searchParams.get('type');

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    // Filter by date range
    if (start && end) {
      where.AND = [
        { start_date: { gte: new Date(start) } },
        { start_date: { lte: new Date(end) } },
      ];
    }

    if (type) {
      where.type = type;
    }

    // Get events
    const events = await prisma.event.findMany({
      where,
      orderBy: { start_date: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/planning/events
 * Create a new event
 */
export async function POST(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = eventSchema.parse(body);

    // Create event
    const event = await prisma.event.create({
      data: {
        ...data,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}

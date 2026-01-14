import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { vehicleSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/vehicles
 * List vehicles with filters
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const { searchParams } = new URL(req.url);

    const ownerId = searchParams.get('owner_id');
    const search = searchParams.get('search') || '';

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (ownerId) {
      where.owner_id = ownerId;
    }

    if (search) {
      where.OR = [
        { vin: { contains: search, mode: 'insensitive' } },
        { license_plate: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        service_records: {
          orderBy: { date: 'desc' },
          take: 3,
        },
        _count: {
          select: {
            service_records: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des véhicules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vehicles
 * Create a new vehicle
 */
export async function POST(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = vehicleSchema.parse(body);

    // Check for duplicate VIN
    const existing = await prisma.vehicle.findFirst({
      where: {
        tenant_id: tenantId,
        vin: data.vin,
        deleted_at: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un véhicule avec ce VIN existe déjà' },
        { status: 400 }
      );
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du véhicule' },
      { status: 500 }
    );
  }
}

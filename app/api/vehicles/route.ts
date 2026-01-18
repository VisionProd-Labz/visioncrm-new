import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehicleSchema } from '@/lib/validations';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/vehicles
 * List vehicles with filters
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_vehicles')) {
      throw ApiErrors.Forbidden('Permission requise: view_vehicles');
    }

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
    return handleApiError(error, {
      route: '/api/vehicles',
      method: 'GET',
    });
  }
}

/**
 * POST /api/vehicles
 * Create a new vehicle
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'create_vehicles')) {
      throw ApiErrors.Forbidden('Permission requise: create_vehicles');
    }

    const body = await req.json();
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
      throw ApiErrors.Conflict('Un véhicule avec ce VIN existe déjà');
    }

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
    return handleApiError(error, {
      route: '/api/vehicles',
      method: 'POST',
    });
  }
}

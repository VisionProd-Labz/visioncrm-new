import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehicleSchema } from '@/lib/validations';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/vehicles/:id
 * Get a single vehicle
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        service_records: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw ApiErrors.NotFound('Véhicule');
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/vehicles/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/vehicles/:id
 * Update a vehicle
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'edit_vehicles')) {
      throw ApiErrors.Forbidden('Permission requise: edit_vehicles');
    }

    const body = await req.json();
    const data = vehicleSchema.partial().parse(body);

    const existing = await prisma.vehicle.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Véhicule');
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        owner: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/vehicles/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/vehicles/:id
 * Soft delete a vehicle
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'delete_vehicles')) {
      throw ApiErrors.Forbidden('Permission requise: delete_vehicles');
    }

    const existing = await prisma.vehicle.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Véhicule');
    }

    await prisma.vehicle.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Véhicule supprimé' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/vehicles/${id}`,
      method: 'DELETE',
    });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { vehicleSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/vehicles/:id
 * Get a single vehicle
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await getCurrentTenantId();

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: id,
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
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du véhicule' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vehicles/:id
 * Update a vehicle
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = vehicleSchema.partial().parse(body);

    // Check vehicle exists
    const existing = await prisma.vehicle.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    // Update vehicle
    const vehicle = await prisma.vehicle.update({
      where: { id: id },
      data,
      include: {
        owner: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du véhicule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vehicles/:id
 * Soft delete a vehicle
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await getCurrentTenantId();

    // Check vehicle exists
    const existing = await prisma.vehicle.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.vehicle.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Véhicule supprimé' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du véhicule' },
      { status: 500 }
    );
  }
}

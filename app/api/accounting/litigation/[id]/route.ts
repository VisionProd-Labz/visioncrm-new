import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { litigationSchema } from '@/lib/accounting/validations';
import { z } from 'zod';

// Utility function to get current tenant ID
async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error('No tenant ID found in session');
  }
  return session.user.tenantId;
}

/**
 * GET /api/accounting/litigation/[id]
 * Get a single litigation case by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();

    const litigationCase = await prisma.litigation.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!litigationCase) {
      return NextResponse.json(
        { error: 'Litige non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(litigationCase);
  } catch (error) {
    console.error('Error fetching litigation case:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du litige' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounting/litigation/[id]
 * Update a litigation case
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate request body (partial update)
    const data = litigationSchema.partial().parse(body);

    // Check if case exists
    const existing = await prisma.litigation.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Litige non trouvé' },
        { status: 404 }
      );
    }

    // Update case
    const litigationCase = await prisma.litigation.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(litigationCase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating litigation case:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du litige' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/litigation/[id]
 * Soft delete a litigation case
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();

    // Check if case exists
    const existing = await prisma.litigation.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Litige non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.litigation.update({
      where: { id: params.id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting litigation case:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du litige' },
      { status: 500 }
    );
  }
}

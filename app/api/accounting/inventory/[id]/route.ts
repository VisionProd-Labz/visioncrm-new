import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { inventoryItemSchema } from '@/lib/accounting/validations';
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
 * GET /api/accounting/inventory/[id]
 * Get a single inventory item by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounting/inventory/[id]
 * Update an inventory item
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate request body (partial update)
    const data = inventoryItemSchema.partial().parse(body);

    // Check if item exists
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // If updating SKU, check for duplicates
    if (data.sku && data.sku !== existing.sku) {
      const duplicate = await prisma.inventoryItem.findFirst({
        where: {
          tenant_id: tenantId,
          sku: data.sku,
          deleted_at: null,
          id: { not: params.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Un article avec ce SKU existe déjà' },
          { status: 400 }
        );
      }
    }

    // Update item
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/inventory/[id]
 * Soft delete an inventory item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getCurrentTenantId();

    // Check if item exists
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        id: params.id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}

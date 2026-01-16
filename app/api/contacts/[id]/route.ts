import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { contactSchema } from '@/lib/validations';
import { z } from 'zod';
import { requirePermission } from '@/lib/middleware/require-permission';

/**
 * GET /api/contacts/:id
 * Get a single contact
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ✅ SECURITY: Check permission FIRST
  const permError = await requirePermission('view_contacts');
  if (permError) return permError;

  try {
    const tenantId = await requireTenantId();

    const contact = await prisma.contact.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        vehicles: {
          include: {
            service_records: {
              orderBy: { date: 'desc' },
              take: 5,
            },
          },
        },
        quotes: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        invoices: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        tasks: {
          where: { status: { not: 'DONE' } },
          orderBy: { created_at: 'desc' },
        },
        activities: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contact' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contacts/:id
 * Update a contact
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ✅ SECURITY: Check permission FIRST
  const permError = await requirePermission('edit_contacts');
  if (permError) return permError;

  try {
    const tenantId = await requireTenantId();
    const body = await req.json();

    // Validate input
    const data = contactSchema.partial().parse(body);

    // Check contact exists
    const existing = await prisma.contact.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id: id },
      data,
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/:id
 * Soft delete a contact
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ✅ SECURITY: Check permission FIRST
  const permError = await requirePermission('delete_contacts');
  if (permError) return permError;

  try {
    const tenantId = await requireTenantId();

    // Check contact exists
    const existing = await prisma.contact.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.contact.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Contact supprimé' });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    );
  }
}

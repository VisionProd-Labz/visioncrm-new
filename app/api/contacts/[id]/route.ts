import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/contacts/:id
 * Get a single contact
 *
 * ✅ REFACTORED: Using error handler (manual wrapper for Next.js 15 compat)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get session and check permission
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_contacts')) {
      throw ApiErrors.Forbidden('Permission requise: view_contacts');
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id,
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
      throw ApiErrors.NotFound('Contact');
    }

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/contacts/${id}`,
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/contacts/:id
 * Update a contact
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

    if (!hasPermission(role, 'edit_contacts')) {
      throw ApiErrors.Forbidden('Permission requise: edit_contacts');
    }

    const body = await req.json();
    const data = contactSchema.partial().parse(body);

    const existing = await prisma.contact.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Contact');
    }

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error, {
      route: `/api/contacts/${id}`,
      method: 'PATCH',
    });
  }
}

/**
 * DELETE /api/contacts/:id
 * Soft delete a contact
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

    if (!hasPermission(role, 'delete_contacts')) {
      throw ApiErrors.Forbidden('Permission requise: delete_contacts');
    }

    const existing = await prisma.contact.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Contact');
    }

    await prisma.contact.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Contact supprimé' });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/contacts/${id}`,
      method: 'DELETE',
    });
  }
}

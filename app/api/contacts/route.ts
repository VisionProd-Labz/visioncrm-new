import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/contacts
 * List contacts with pagination and filters
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          vehicles: true,
          _count: {
            select: {
              quotes: true,
              invoices: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/contacts',
      method: 'GET',
    });
  }
}

/**
 * POST /api/contacts
 * Create a new contact
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

    if (!hasPermission(role, 'create_contacts')) {
      throw ApiErrors.Forbidden('Permission requise: create_contacts');
    }

    const body = await req.json();
    const data = contactSchema.parse(body);

    // Check for duplicate email
    if (data.email) {
      const existing = await prisma.contact.findFirst({
        where: {
          tenant_id: tenantId,
          email: data.email,
          deleted_at: null,
        },
      });

      if (existing) {
        throw ApiErrors.Conflict('Un contact avec cet email existe déjà');
      }
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/contacts',
      method: 'POST',
    });
  }
}

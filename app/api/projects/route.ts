import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  contactId: z.string().optional(),
  quoteId: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * POST /api/projects
 * Create a new project
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'create_projects')) {
      throw ApiErrors.Forbidden('Permission requise: create_projects');
    }

    const body = await req.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        contact_id: data.contactId,
        quote_id: data.quoteId,
        start_date: data.startDate ? new Date(data.startDate) : null,
        end_date: data.endDate ? new Date(data.endDate) : null,
        tenant_id: tenantId,
        created_by: user.id,
      },
      include: {
        contact: true,
        quote: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/projects',
      method: 'POST',
    });
  }
}

/**
 * GET /api/projects
 * List all projects
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'view_projects')) {
      throw ApiErrors.Forbidden('Permission requise: view_projects');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const contactId = searchParams.get('contactId');

    const projects = await prisma.project.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        ...(status && { status: status as any }),
        ...(contactId && { contact_id: contactId }),
      },
      include: {
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        quote: {
          select: {
            id: true,
            quote_number: true,
            total: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return handleApiError(error, {
      route: '/api/projects',
      method: 'GET',
    });
  }
}

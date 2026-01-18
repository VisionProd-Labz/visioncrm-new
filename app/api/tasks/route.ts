import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/tasks
 * List tasks with filters
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

    if (!hasPermission(role, 'view_tasks')) {
      throw ApiErrors.Forbidden('Permission requise: view_tasks');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assignee_id');
    const contactId = searchParams.get('contact_id');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assignee_id = assigneeId;
    }

    if (contactId) {
      where.contact_id = contactId;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { due_date: 'asc' },
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/tasks',
      method: 'GET',
    });
  }
}

/**
 * POST /api/tasks
 * Create a new task
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

    if (!hasPermission(role, 'create_tasks')) {
      throw ApiErrors.Forbidden('Permission requise: create_tasks');
    }

    const body = await req.json();
    const data = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        tenant_id: tenantId,
        title: data.title,
        description: data.description,
        assignee_id: data.assignee_id,
        contact_id: data.contact_id,
        due_date: data.due_date ? new Date(data.due_date) : null,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/tasks',
      method: 'POST',
    });
  }
}

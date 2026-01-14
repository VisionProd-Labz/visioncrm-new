import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/tasks
 * List tasks with filters
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
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
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = taskSchema.parse(body);

    // Create task
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const taskCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

/**
 * GET /api/settings/task-categories
 * List task categories
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

    if (!hasPermission(role, 'view_settings')) {
      throw ApiErrors.Forbidden('Permission requise: view_settings');
    }

    const categories = await prisma.taskCategory.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/task-categories',
      method: 'GET',
    });
  }
}

/**
 * POST /api/settings/task-categories
 * Create task category
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

    if (!hasPermission(role, 'edit_settings')) {
      throw ApiErrors.Forbidden('Permission requise: edit_settings');
    }

    const body = await req.json();
    const data = taskCategorySchema.parse(body);

    // If this is set as default, unset other defaults
    if (data.is_default) {
      await prisma.taskCategory.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const category = await prisma.taskCategory.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/settings/task-categories',
      method: 'POST',
    });
  }
}

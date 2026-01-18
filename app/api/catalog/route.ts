import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const catalogItemSchema = z.object({
  name: z.string().min(1).max(255),
  reference: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  image_url: z.string().url().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/catalog
 * List catalog items with filters
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

    if (!hasPermission(role, 'view_catalog')) {
      throw ApiErrors.Forbidden('Permission requise: view_catalog');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.catalogItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.catalogItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/catalog',
      method: 'GET',
    });
  }
}

/**
 * POST /api/catalog
 * Create a new catalog item
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

    if (!hasPermission(role, 'edit_catalog')) {
      throw ApiErrors.Forbidden('Permission requise: edit_catalog');
    }

    const body = await req.json();
    const data = catalogItemSchema.parse(body);

    const existing = await prisma.catalogItem.findFirst({
      where: {
        tenant_id: tenantId,
        reference: data.reference,
        deleted_at: null,
      },
    });

    if (existing) {
      throw ApiErrors.BadRequest('Un produit avec cette référence existe déjà');
    }

    const item = await prisma.catalogItem.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/catalog',
      method: 'POST',
    });
  }
}

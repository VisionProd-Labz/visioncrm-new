import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

// Helper to get tenant ID or fail
async function getTenantIdOrFail() {
  const tenantId = await requireTenantId();
  if (!tenantId) {
    throw new Error('UNAUTHORIZED');
  }
  return tenantId;
}

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
 */
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_catalog');
    if (permError) return permError;

    const tenantId = await getTenantIdOrFail();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
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

    // Get catalog items with pagination
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
    console.error('Get catalog items error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du catalogue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog
 * Create a new catalog item
 */
export async function POST(req: Request) {
  try {
    const tenantId = await getTenantIdOrFail();
    const body = await req.json();

    // Validate input
    const data = catalogItemSchema.parse(body);

    // Check for duplicate reference
    const existing = await prisma.catalogItem.findFirst({
      where: {
        tenant_id: tenantId,
        reference: data.reference,
        deleted_at: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un produit avec cette référence existe déjà' },
        { status: 400 }
      );
    }

    // Create catalog item
    const item = await prisma.catalogItem.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create catalog item error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}

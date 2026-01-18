import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { inventoryItemSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/inventory
 * List all inventory items for the current tenant
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

    if (!hasPermission(role, 'view_inventory')) {
      throw ApiErrors.Forbidden('Permission requise: view_inventory');
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (category) where.category = category;

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const filteredItems = lowStock
      ? items.filter(item => item.quantity <= item.reorder_point)
      : items;

    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + Number(item.total_value), 0),
      lowStockItems: items.filter(item => item.quantity <= item.reorder_point).length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      categories: Array.from(new Set(items.map(item => item.category))),
    };

    return NextResponse.json({ items: filteredItems, stats });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/inventory',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/inventory
 * Create a new inventory item
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

    if (!hasPermission(role, 'create_inventory')) {
      throw ApiErrors.Forbidden('Permission requise: create_inventory');
    }

    const body = await req.json();
    const data = inventoryItemSchema.parse(body);

    const existing = await prisma.inventoryItem.findFirst({
      where: {
        tenant_id: tenantId,
        sku: data.sku,
        deleted_at: null,
      },
    });

    if (existing) {
      throw ApiErrors.BadRequest('Un article avec ce SKU existe déjà');
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/inventory',
      method: 'POST',
    });
  }
}

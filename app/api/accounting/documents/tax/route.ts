import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { taxDocumentSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/documents/tax
 * List all tax documents for the current tenant
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

    if (!hasPermission(role, 'view_tax_documents')) {
      throw ApiErrors.Forbidden('Permission requise: view_tax_documents');
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const type = searchParams.get('type');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (year) where.year = parseInt(year);
    if (type) where.type = type;

    const documents = await prisma.taxDocument.findMany({
      where,
      orderBy: [{ year: 'desc' }, { period: 'desc' }],
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/tax',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/documents/tax
 * Create a new tax document
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

    if (!hasPermission(role, 'upload_tax_documents')) {
      throw ApiErrors.Forbidden('Permission requise: upload_tax_documents');
    }

    const body = await req.json();
    const data = taxDocumentSchema.parse(body);

    const { metadata, ...rest } = data;
    const document = await prisma.taxDocument.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        ...(metadata && { metadata }),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/tax',
      method: 'POST',
    });
  }
}

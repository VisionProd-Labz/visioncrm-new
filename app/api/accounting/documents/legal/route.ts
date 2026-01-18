import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { legalDocumentSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/documents/legal
 * List all legal documents for the current tenant
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

    if (!hasPermission(role, 'view_legal_documents')) {
      throw ApiErrors.Forbidden('Permission requise: view_legal_documents');
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const type = searchParams.get('type');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (year) {
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);
      where.issue_date = {
        gte: yearStart,
        lte: yearEnd,
      };
    }
    if (type) where.type = type;

    const documents = await prisma.legalDocument.findMany({
      where,
      orderBy: [{ issue_date: 'desc' }, { created_at: 'desc' }],
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/legal',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/documents/legal
 * Create a new legal document
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

    if (!hasPermission(role, 'upload_legal_documents')) {
      throw ApiErrors.Forbidden('Permission requise: upload_legal_documents');
    }

    const body = await req.json();
    const data = legalDocumentSchema.parse(body);

    const { metadata, ...rest } = data;
    const document = await prisma.legalDocument.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        ...(metadata && { metadata }),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/legal',
      method: 'POST',
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { payrollDocumentSchema } from '@/lib/accounting/validations';

/**
 * GET /api/accounting/documents/payroll
 * List all payroll documents for the current tenant
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

    if (!hasPermission(role, 'view_payroll')) {
      throw ApiErrors.Forbidden('Permission requise: view_payroll');
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

    const documents = await prisma.payrollDocument.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/payroll',
      method: 'GET',
    });
  }
}

/**
 * POST /api/accounting/documents/payroll
 * Create a new payroll document
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

    if (!hasPermission(role, 'upload_payroll')) {
      throw ApiErrors.Forbidden('Permission requise: upload_payroll');
    }

    const body = await req.json();
    const data = payrollDocumentSchema.parse(body);

    const { metadata, ...rest } = data;
    const document = await prisma.payrollDocument.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        ...(metadata && { metadata }),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents/payroll',
      method: 'POST',
    });
  }
}

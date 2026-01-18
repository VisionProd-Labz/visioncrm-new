import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { z } from 'zod';

const documentSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  file_url: z.string().url(),
  file_type: z.string().min(1).max(50),
  file_size: z.number().int().positive(),
  metadata: z.any().optional(),
});

/**
 * GET /api/company/documents
 * List company documents
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

    if (!hasPermission(role, 'view_company_documents')) {
      throw ApiErrors.Forbidden('Permission requise: view_company_documents');
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/company/documents',
      method: 'GET',
    });
  }
}

/**
 * POST /api/company/documents
 * Upload a new document
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

    if (!hasPermission(role, 'upload_company_documents')) {
      throw ApiErrors.Forbidden('Permission requise: upload_company_documents');
    }

    const body = await req.json();
    const data = documentSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/company/documents',
      method: 'POST',
    });
  }
}

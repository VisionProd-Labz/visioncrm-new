import { NextRequest, NextResponse } from 'next/server';
import { requireTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { taxDocumentSchema } from '@/lib/accounting/validations';
import { z } from 'zod';
import { requirePermission } from '@/lib/middleware/require-permission';


/**
 * GET /api/accounting/documents/tax
 * List all tax documents for the current tenant
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_tax_documents');
    if (permError) return permError;

    const tenantId = await requireTenantId();
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
    console.error('Error fetching tax documents:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des documents fiscaux' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/documents/tax
 * Create a new tax document
 */
export async function POST(req: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const session = await auth();
    const body = await req.json();

    // Validate request body
    const data = taxDocumentSchema.parse(body);

    // Create document
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating tax document:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du document' },
      { status: 500 }
    );
  }
}

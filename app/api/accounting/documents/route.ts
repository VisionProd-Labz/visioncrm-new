import { NextRequest, NextResponse } from 'next/server';
import { requireTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';


/**
 * GET /api/accounting/documents
 * List all documents (tax, payroll, legal) for the current tenant
 * Query params:
 * - type: Filter by document category (TAX, PAYROLL, LEGAL)
 */
export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');

    // Fetch all document types in parallel
    const [taxDocs, payrollDocs, legalDocs] = await Promise.all([
      type === null || type === 'TAX'
        ? prisma.taxDocument.findMany({
            where: { tenant_id: tenantId, deleted_at: null },
            orderBy: { created_at: 'desc' },
          })
        : [],
      type === null || type === 'PAYROLL'
        ? prisma.payrollDocument.findMany({
            where: { tenant_id: tenantId, deleted_at: null },
            orderBy: { created_at: 'desc' },
          })
        : [],
      type === null || type === 'LEGAL'
        ? prisma.legalDocument.findMany({
            where: { tenant_id: tenantId, deleted_at: null },
            orderBy: { created_at: 'desc' },
          })
        : [],
    ]);

    // Normalize documents with a common structure
    const documents = [
      ...taxDocs.map(doc => ({
        ...doc,
        category: 'TAX' as const,
        document_type: doc.type,
      })),
      ...payrollDocs.map(doc => ({
        ...doc,
        category: 'PAYROLL' as const,
        document_type: 'PAYROLL_DOCUMENT',
      })),
      ...legalDocs.map(doc => ({
        ...doc,
        category: 'LEGAL' as const,
        document_type: doc.type,
      })),
    ].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate stats
    const stats = {
      totalDocuments: documents.length,
      taxDocuments: taxDocs.length,
      payrollDocuments: payrollDocs.length,
      legalDocuments: legalDocs.length,
      currentYear: new Date().getFullYear(),
    };

    return NextResponse.json({ documents, stats });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des documents' },
      { status: 500 }
    );
  }
}

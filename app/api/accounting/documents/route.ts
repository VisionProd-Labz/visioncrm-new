import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * GET /api/accounting/documents
 * List all documents (tax, payroll, legal) for the current tenant
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

    if (!hasPermission(role, 'view_company_documents')) {
      throw ApiErrors.Forbidden('Permission requise: view_company_documents');
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

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

    const stats = {
      totalDocuments: documents.length,
      taxDocuments: taxDocs.length,
      payrollDocuments: payrollDocs.length,
      legalDocuments: legalDocs.length,
      currentYear: new Date().getFullYear(),
    };

    return NextResponse.json({ documents, stats });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/accounting/documents',
      method: 'GET',
    });
  }
}

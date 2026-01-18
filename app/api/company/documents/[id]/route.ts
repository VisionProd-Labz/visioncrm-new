import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';

/**
 * DELETE /api/company/documents/[id]
 * Delete a document
 *
 * ✅ REFACTORED: Using centralized error handler
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      throw ApiErrors.Unauthorized();
    }

    const user = session.user as any;
    const role = user.role as Role;
    const tenantId = user.tenantId as string;

    if (!hasPermission(role, 'delete_company_documents')) {
      throw ApiErrors.Forbidden('Permission requise: delete_company_documents');
    }

    const existing = await prisma.document.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw ApiErrors.NotFound('Document');
    }

    await prisma.document.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      route: `/api/company/documents/${id}`,
      method: 'DELETE',
    });
  }
}

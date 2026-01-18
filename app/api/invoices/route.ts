import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invoiceSchema } from '@/lib/validations';
import { sendInvoiceEmail } from '@/lib/email';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { calculateTotals } from '@/lib/utils/invoice-calculations';
import { generateDocumentNumber } from '@/lib/utils/document-numbers';

/**
 * GET /api/invoices
 * List invoices with filters
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

    if (!hasPermission(role, 'view_invoices')) {
      throw ApiErrors.Forbidden('Permission requise: view_invoices');
    }

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contact_id');
    const status = searchParams.get('status');

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (contactId) {
      where.contact_id = contactId;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            company: true,
          },
        },
        quote: {
          select: {
            id: true,
            quote_number: true,
          },
        },
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/invoices',
      method: 'GET',
    });
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 *
 * ✅ REFACTORED: Using centralized utilities
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

    if (!hasPermission(role, 'create_invoices')) {
      throw ApiErrors.Forbidden('Permission requise: create_invoices');
    }

    const body = await req.json();
    const data = invoiceSchema.parse(body);

    // Calculate totals using centralized utility
    const totals = calculateTotals(data.items);

    // Generate invoice number using centralized utility
    const invoiceNumber = await generateDocumentNumber(tenantId, 'invoice');

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        contact_id: data.contact_id,
        quote_id: data.quote_id,
        invoice_number: invoiceNumber,
        due_date: new Date(data.due_date),
        items: data.items,
        ...totals,
        siret: data.siret,
        tva_number: data.tva_number,
        notes: data.notes,
        status: 'DRAFT',
      },
      include: {
        contact: true,
        quote: true,
      },
    });

    // Send email to contact (non-blocking)
    if (invoice.contact.email) {
      try {
        await sendInvoiceEmail({
          to: invoice.contact.email,
          contactName: `${invoice.contact.first_name} ${invoice.contact.last_name}`,
          invoiceNumber: invoice.invoice_number,
          invoiceId: invoice.id,
          total: Number(invoice.total),
          dueDate: new Date(invoice.due_date).toLocaleDateString('fr-FR'),
        });
        console.log(`Invoice email sent to ${invoice.contact.email}`);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }
    } else {
      console.warn(`No email address for contact ${invoice.contact_id}, skipping invoice email`);
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/invoices',
      method: 'POST',
    });
  }
}

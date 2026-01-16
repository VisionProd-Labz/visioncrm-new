import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { invoiceSchema } from '@/lib/validations';
import { sendInvoiceEmail } from '@/lib/email';
import { z } from 'zod';

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FACT-${year}`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      tenant_id: tenantId,
      invoice_number: { startsWith: prefix },
    },
    orderBy: { created_at: 'desc' },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastNumber = lastInvoice.invoice_number.split('-').pop();
    sequence = parseInt(lastNumber || '0') + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Calculate totals from items
 */
function calculateTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const vatRate = items[0]?.vat_rate || 20;
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    vat_rate: vatRate,
    vat_amount: Number(vatAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * GET /api/invoices
 * List invoices with filters
 */
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_invoices');
    if (permError) return permError;

    const tenantId = await requireTenantId();
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
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(req: Request) {
  try {
    const tenantId = await requireTenantId();
    const body = await req.json();

    // Validate input
    const data = invoiceSchema.parse(body);

    // Calculate totals
    const totals = calculateTotals(data.items);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(tenantId);

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
        // Log error but don't fail the invoice creation
        console.error('Failed to send invoice email:', emailError);
        // You could store this in a queue for retry later
      }
    } else {
      console.warn(`No email address for contact ${invoice.contact_id}, skipping invoice email`);
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { sendInvoiceEmail } from '@/lib/email';

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
 * POST /api/quotes/:id/convert
 * Convert a quote to an invoice
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await requireTenantId();

    // Get quote
    const quote = await prisma.quote.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        invoice: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (quote.invoice) {
      return NextResponse.json(
        { error: 'Ce devis a déjà été converti en facture', invoice: quote.invoice },
        { status: 400 }
      );
    }

    // Check quote status
    if (quote.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Le devis doit être accepté avant conversion' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(tenantId);

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice from quote
    const invoice = await prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        contact_id: quote.contact_id,
        quote_id: quote.id,
        invoice_number: invoiceNumber,
        due_date: dueDate,
        items: quote.items as any,
        subtotal: quote.subtotal,
        vat_rate: quote.vat_rate,
        vat_amount: quote.vat_amount,
        total: quote.total,
        notes: quote.notes,
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
          dueDate: invoice.due_date.toLocaleDateString('fr-FR'),
        });
        console.log(`Invoice email sent to ${invoice.contact.email} (converted from quote)`);
      } catch (emailError) {
        // Log error but don't fail the conversion
        console.error('Failed to send invoice email:', emailError);
      }
    } else {
      console.warn(`No email address for contact ${invoice.contact_id}, skipping invoice email`);
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Convert quote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis' },
      { status: 500 }
    );
  }
}

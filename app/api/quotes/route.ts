import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { quoteSchema } from '@/lib/validations';
import { sendQuoteEmail } from '@/lib/email';
import { z } from 'zod';

/**
 * Generate unique quote number
 */
async function generateQuoteNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}`;

  const lastQuote = await prisma.quote.findFirst({
    where: {
      tenant_id: tenantId,
      quote_number: { startsWith: prefix },
    },
    orderBy: { created_at: 'desc' },
  });

  let sequence = 1;
  if (lastQuote) {
    const lastNumber = lastQuote.quote_number.split('-').pop();
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
 * GET /api/quotes
 * List quotes with filters
 */
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_quotes');
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

    const quotes = await prisma.quote.findMany({
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
      },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotes
 * Create a new quote
 */
export async function POST(req: Request) {
  try {
    const tenantId = await requireTenantId();
    const body = await req.json();

    // Validate input
    const data = quoteSchema.parse(body);

    // Calculate totals
    const totals = calculateTotals(data.items);

    // Generate quote number
    const quoteNumber = await generateQuoteNumber(tenantId);

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        tenant_id: tenantId,
        contact_id: data.contact_id,
        quote_number: quoteNumber,
        valid_until: new Date(data.valid_until),
        items: data.items,
        ...totals,
        notes: data.notes,
        status: 'DRAFT',
      },
      include: {
        contact: true,
      },
    });

    // Send email to contact (non-blocking)
    if (quote.contact.email) {
      try {
        await sendQuoteEmail({
          to: quote.contact.email,
          contactName: `${quote.contact.first_name} ${quote.contact.last_name}`,
          quoteNumber: quote.quote_number,
          quoteId: quote.id,
          total: Number(quote.total),
        });
        console.log(`Quote email sent to ${quote.contact.email}`);
      } catch (emailError) {
        // Log error but don't fail the quote creation
        console.error('Failed to send quote email:', emailError);
        // You could store this in a queue for retry later
      }
    } else {
      console.warn(`No email address for contact ${quote.contact_id}, skipping quote email`);
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create quote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du devis' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { quoteSchema } from '@/lib/validations';
import { sendQuoteEmail } from '@/lib/email';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { auth } from '@/auth';
import { hasPermission, type Role } from '@/lib/permissions';
import { calculateTotals } from '@/lib/utils/invoice-calculations';
import { generateDocumentNumber } from '@/lib/utils/document-numbers';

/**
 * GET /api/quotes
 * List quotes with filters
 *
 * ✅ REFACTORED: Using centralized utilities and error handler
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

    if (!hasPermission(role, 'view_quotes')) {
      throw ApiErrors.Forbidden('Permission requise: view_quotes');
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
    return handleApiError(error, {
      route: '/api/quotes',
      method: 'GET',
    });
  }
}

/**
 * POST /api/quotes
 * Create a new quote
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

    if (!hasPermission(role, 'create_quotes')) {
      throw ApiErrors.Forbidden('Permission requise: create_quotes');
    }

    const body = await req.json();
    const data = quoteSchema.parse(body);

    // Calculate totals using centralized utility
    const totals = calculateTotals(data.items);

    // Generate quote number using centralized utility
    const quoteNumber = await generateDocumentNumber(tenantId, 'quote');

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
        console.error('Failed to send quote email:', emailError);
      }
    } else {
      console.warn(`No email address for contact ${quote.contact_id}, skipping quote email`);
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/quotes',
      method: 'POST',
    });
  }
}

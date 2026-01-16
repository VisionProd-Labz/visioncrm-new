import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

const accountSchema = z.object({
  provider: z.enum(['RESEND', 'GMAIL', 'OUTLOOK', 'SMTP']),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  smtp_config: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
  }).optional(),
  connected: z.boolean().optional(),
});

/**
 * GET /api/email/accounts
 * List email accounts
 */
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('view_emails');
    if (permError) return permError;

    const tenantId = await requireTenantId();

    const accounts = await prisma.emailAccount.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        provider: true,
        email: true,
        name: true,
        connected: true,
        created_at: true,
        updated_at: true,
        // Don't expose tokens
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get email accounts error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des comptes email' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/accounts
 * Create a new email account
 */
export async function POST(req: Request) {
  try {
    const tenantId = await requireTenantId();
    const body = await req.json();

    // Validate input
    const data = accountSchema.parse(body);

    // Check if account already exists
    const existing = await prisma.emailAccount.findFirst({
      where: {
        tenant_id: tenantId,
        email: data.email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Create account
    const account = await prisma.emailAccount.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        provider: true,
        email: true,
        name: true,
        connected: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create email account error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte email' },
      { status: 500 }
    );
  }
}

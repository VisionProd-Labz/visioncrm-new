import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const dsarRequestSchema = z.object({
  request_type: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION']),
  notes: z.string().optional(),
});

/**
 * POST /api/rgpd/dsar/request
 * Create a new DSAR request
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = dsarRequestSchema.parse(body);

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;

    // Create DSAR request
    const dsarRequest = await prisma.dsarRequest.create({
      data: {
        user_id: session.user.id,
        request_type: data.request_type,
        status: 'PENDING',
        notes: data.notes,
        ip_address: ip,
        user_agent: userAgent,
      },
    });

    // TODO: Send email notification to DPO
    // TODO: Send confirmation email to user

    return NextResponse.json(dsarRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create DSAR request error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

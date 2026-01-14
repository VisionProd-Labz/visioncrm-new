import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId, requireTenantId } from '@/lib/tenant';
import { z } from 'zod';

const conversationSchema = z.object({
  contact_name: z.string().min(1).max(255),
  contact_phone: z.string().min(1).max(20),
  platform: z.enum(['WHATSAPP', 'TELEGRAM', 'SMS']),
});

/**
 * GET /api/communications/conversations
 * List conversations
 */
export async function GET(req: Request) {
  try {
    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);

    const platform = searchParams.get('platform');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
    };

    if (platform && platform !== 'all') {
      where.platform = platform;
    }

    if (search) {
      where.OR = [
        { contact_name: { contains: search, mode: 'insensitive' } },
        { contact_phone: { contains: search } },
      ];
    }

    // Get conversations with messages count
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { last_message_at: 'desc' },
      include: {
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communications/conversations
 * Create a new conversation
 */
export async function POST(req: Request) {
  try {
    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();

    // Validate input
    const data = conversationSchema.parse(body);

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        tenant_id: tenantId,
        contact_phone: data.contact_phone,
        platform: data.platform,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Une conversation existe déjà avec ce contact sur cette plateforme' },
        { status: 400 }
      );
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}

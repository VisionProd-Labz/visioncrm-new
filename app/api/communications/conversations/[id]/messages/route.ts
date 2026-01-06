import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1),
  sender: z.enum(['ME', 'THEM']),
  status: z.enum(['SENT', 'DELIVERED', 'READ']).optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/communications/conversations/[id]/messages
 * List messages for a conversation
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await getCurrentTenantId();

    // Verify conversation belongs to tenant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversation_id: id,
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communications/conversations/[id]/messages
 * Send a new message
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tenantId = await getCurrentTenantId();
    const body = await req.json();

    // Validate input
    const data = messageSchema.parse(body);

    // Verify conversation belongs to tenant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        tenant_id: tenantId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        ...data,
        conversation_id: id,
      },
    });

    // Update conversation last message info
    await prisma.conversation.update({
      where: { id: id },
      data: {
        last_message: data.content,
        last_message_at: new Date(),
        unread_count: data.sender === 'THEM' ? { increment: 1 } : undefined,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

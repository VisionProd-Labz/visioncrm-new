import { NextResponse } from 'next/server';
import { assistantAgent } from '@/lib/gemini';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAIQuota, incrementAIUsage } from '@/lib/ai-rate-limit';
import { aiChatSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * POST /api/ai/assistant
 * Chat with AI assistant
 */
export async function POST(req: Request) {
  try {
    const tenant = await getCurrentTenant();
    const body = await req.json();

    // Validate input
    const { message, context } = aiChatSchema.parse(body);

    // Check AI quota
    const hasQuota = await checkAIQuota(tenant.id, tenant.plan);

    if (!hasQuota) {
      return NextResponse.json(
        {
          error: 'Quota IA épuisé',
          message: 'Vous avez atteint votre limite mensuelle de requêtes IA. Mettez à niveau votre plan pour continuer.',
        },
        { status: 429 }
      );
    }

    // Generate response
    const result = await assistantAgent.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: context
                ? `Contexte: ${JSON.stringify(context)}\n\nQuestion: ${message}`
                : message,
            },
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.text();

    // Increment usage
    await incrementAIUsage(tenant.id);

    return NextResponse.json({
      reply: text,
      usage: {
        inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('AI assistant error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}

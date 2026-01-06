import { NextResponse } from 'next/server';
import { getCurrentTenantId } from '@/lib/tenant';
import { generateAIResponse, buildAIContext, AgentType } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { aiChatSchema } from '@/lib/validations';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai/chat
 * Send a message to the AI assistant
 */
export async function POST(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();

    // Check rate limit
    const rateLimit = await checkRateLimit(tenantId, 'ai_chat');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Limite de messages atteinte. Réessayez dans ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes.`,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // Validate input
    const body = await req.json();
    const data = aiChatSchema.parse(body);

    // Determine agent type (default to assistant)
    const agentType: AgentType = (body.agent as AgentType) || 'assistant';

    // Fetch relevant CRM data for context
    const context = await buildCRMContext(tenantId, data.context);

    // Generate AI response
    const response = await generateAIResponse(agentType, data.message, context);

    return NextResponse.json(
      {
        response,
        agent: agentType,
        remaining: rateLimit.remaining,
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Message invalide', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('AI chat error:', error);
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la génération de la réponse' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * Build CRM context based on user request
 */
async function buildCRMContext(tenantId: string, requestedContext?: Record<string, any>) {
  const contextData: any = {};

  try {
    // Always include recent data for better responses
    const includeAll = !requestedContext || Object.keys(requestedContext).length === 0;

    // Fetch contacts if requested or by default
    if (includeAll || requestedContext?.contacts) {
      const contacts = await prisma.contact.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: 50,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          company: true,
          email: true,
          phone: true,
          is_vip: true,
        },
      });
      contextData.contacts = contacts;
    }

    // Fetch recent quotes
    if (includeAll || requestedContext?.quotes) {
      const quotes = await prisma.quote.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: 20,
        orderBy: { created_at: 'desc' },
        include: {
          contact: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });
      contextData.quotes = quotes;
    }

    // Fetch recent invoices
    if (includeAll || requestedContext?.invoices) {
      const invoices = await prisma.invoice.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: 20,
        orderBy: { created_at: 'desc' },
        include: {
          contact: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });
      contextData.invoices = invoices;
    }

    // Fetch recent tasks
    if (includeAll || requestedContext?.tasks) {
      const tasks = await prisma.task.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: 30,
        orderBy: { created_at: 'desc' },
        include: {
          assignee: {
            select: {
              name: true,
            },
          },
        },
      });
      contextData.tasks = tasks;
    }

    // Fetch vehicles if requested
    if (requestedContext?.vehicles) {
      const vehicles = await prisma.vehicle.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: 30,
        orderBy: { created_at: 'desc' },
        include: {
          owner: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });
      contextData.vehicles = vehicles;
    }

    // Build formatted context
    return buildAIContext(contextData);
  } catch (error) {
    console.error('Error building CRM context:', error);
    return {};
  }
}

/**
 * GET /api/ai/chat
 * Get AI usage stats
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();

    const { getRateLimitStatus } = await import('@/lib/rate-limit');
    const status = await getRateLimitStatus(tenantId, 'ai_chat');

    return NextResponse.json({
      quota: {
        used: status.used,
        limit: status.limit,
        remaining: status.remaining,
      },
    });
  } catch (error) {
    console.error('Get AI stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

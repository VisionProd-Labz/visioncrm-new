import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const policySchema = z.object({
  entity_type: z.string().min(1),
  retention_days: z.number().int().min(1).max(3650), // Max 10 years
  is_active: z.boolean().default(true),
});

/**
 * GET /api/admin/data-retention
 * Get data retention policies (admin only)
 */
export async function GET(req: Request) {
  try {
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('edit_settings');
    if (permError) return permError;

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Get all policies for tenant
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: {
        tenant_id: (session.user as any).tenantId,
      },
      orderBy: {
        entity_type: 'asc',
      },
    });

    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Get data retention policies error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des politiques' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/data-retention
 * Create or update a data retention policy (admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = policySchema.parse(body);

    // Upsert policy
    const policy = await prisma.dataRetentionPolicy.upsert({
      where: {
        tenant_id_entity_type: {
          tenant_id: (session.user as any).tenantId,
          entity_type: data.entity_type,
        },
      },
      update: {
        retention_days: data.retention_days,
        is_active: data.is_active,
      },
      create: {
        tenant_id: (session.user as any).tenantId,
        entity_type: data.entity_type,
        retention_days: data.retention_days,
        is_active: data.is_active,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create/update policy error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la politique' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/data-retention
 * Toggle policy active status
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    // Update policy
    const policy = await prisma.dataRetentionPolicy.update({
      where: {
        id,
        tenant_id: (session.user as any).tenantId,
      },
      data: {
        is_active,
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Update policy status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la politique' },
      { status: 500 }
    );
  }
}

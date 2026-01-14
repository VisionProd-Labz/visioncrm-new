import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/rgpd/dsar/requests
 * Get user's DSAR requests
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const requests = await prisma.dsarRequest.findMany({
      where: {
        user_id: session.user.id,
      },
      orderBy: {
        requested_at: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get DSAR requests error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}

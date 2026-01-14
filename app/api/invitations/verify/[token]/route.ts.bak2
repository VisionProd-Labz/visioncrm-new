import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/invitations/verify/[token] - Verify invitation token
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: {
        token,
      },
      include: {
        tenant: {
          select: {
            name: true,
            company_name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      );
    }

    const isExpired = new Date() > new Date(invitation.expires_at);
    const isAccepted = invitation.accepted_at !== null;

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        companyName: invitation.tenant.company_name || invitation.tenant.name,
        expiresAt: invitation.expires_at,
        isExpired,
        isAccepted,
      },
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'invitation' },
      { status: 500 }
    );
  }
}

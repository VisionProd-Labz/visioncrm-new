import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const acceptSchema = z.object({
  name: z.string().min(1).max(255),
  password: z.string().min(12),
});

// POST /api/invitations/accept/[token] - Accept invitation and create account
export async function POST(
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

    const body = await req.json();
    const data = acceptSchema.parse(body);

    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: {
        token,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json(
        { error: 'Cette invitation a déjà été utilisée' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists in the tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: invitation.email,
        tenantId: invitation.tenant_id,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user and mark invitation as accepted
    const [user] = await Promise.all([
      prisma.user.create({
        data: {
          email: invitation.email,
          name: data.name,
          password: hashedPassword,
          role: invitation.role,
          tenantId: invitation.tenant_id,
        },
      }),
      prisma.teamInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          accepted_at: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'acceptation de l\'invitation' },
      { status: 500 }
    );
  }
}

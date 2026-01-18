import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/email-service';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import crypto from 'crypto';

/**
 * POST /api/auth/send-verification
 * Send email verification link
 *
 * PUBLIC ENDPOINT - No auth required
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      throw ApiErrors.BadRequest('Email invalide');
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        message: 'Si cet email existe, un lien de vérification a été envoyé',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email déjà vérifié',
        verified: true,
      });
    }

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Générer nouveau token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Expire dans 24h

    // Stocker token
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expires,
        used: false,
      },
    });

    // Envoyer email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: 'Email de vérification envoyé',
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/auth/send-verification',
      method: 'POST',
    });
  }
}

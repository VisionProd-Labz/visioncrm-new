import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';

/**
 * POST /api/auth/verify-email
 * Verify email with token
 *
 * PUBLIC ENDPOINT - No auth required
 */
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      throw ApiErrors.BadRequest('Token manquant');
    }

    // Trouver le token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!verificationToken) {
      throw ApiErrors.BadRequest('Token invalide ou expiré');
    }

    // Vérifier si déjà utilisé
    if (verificationToken.used) {
      throw ApiErrors.BadRequest('Ce lien a déjà été utilisé');
    }

    // Vérifier expiration
    if (new Date() > verificationToken.expires) {
      throw ApiErrors.BadRequest('Ce lien a expiré. Demandez un nouveau lien de vérification');
    }

    // Vérifier si email déjà vérifié
    if (verificationToken.user.emailVerified) {
      // Marquer le token comme utilisé
      await prisma.emailVerificationToken.update({
        where: { token },
        data: { used: true },
      });

      return NextResponse.json({
        message: 'Email déjà vérifié',
        verified: true,
      });
    }

    // Activer le compte en une transaction
    await prisma.$transaction([
      // 1. Mettre à jour l'utilisateur
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: new Date(),
        },
      }),
      // 2. Marquer le token comme utilisé
      prisma.emailVerificationToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    console.log('[EMAIL_VERIFICATION] Email verified successfully for user ' + verificationToken.user.email);

    return NextResponse.json({
      message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      verified: true,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/auth/verify-email',
      method: 'POST',
    });
  }
}

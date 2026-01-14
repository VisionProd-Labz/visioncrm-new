import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/verify-email
 * Verify user's email address with token
 */
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      );
    }

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        {
          error: 'Ce lien de vérification a expiré. Veuillez demander un nouveau lien.',
        },
        { status: 400 }
      );
    }

    // Check if token already used
    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Ce lien de vérification a déjà été utilisé' },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (verificationToken.user.emailVerified) {
      // Mark token as used
      await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      return NextResponse.json({
        message: 'Votre email est déjà vérifié',
        user: {
          id: verificationToken.user.id,
          email: verificationToken.user.email,
          emailVerified: verificationToken.user.emailVerified,
        },
      });
    }

    // Verify email and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    console.log(`Email verified for user: ${verificationToken.user.email}`);

    return NextResponse.json({
      message: 'Votre email a été vérifié avec succès !',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        emailVerified: new Date(),
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email
 * Verify email using token from URL query parameter (for email links)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=missing_token`
      );
    }

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=invalid_token`
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=expired_token`
      );
    }

    // Check if token already used
    if (verificationToken.used) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=used_token`
      );
    }

    // Check if email is already verified
    if (verificationToken.user.emailVerified) {
      await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?success=already_verified`
      );
    }

    // Verify email and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    console.log(`Email verified for user: ${verificationToken.user.email}`);

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verify-email?success=verified`
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verify-email?error=server_error`
    );
  }
}

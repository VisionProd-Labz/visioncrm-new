import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/email-service';
import crypto from 'crypto';

/**
 * Resend verification email endpoint
 * Allows users to request a new verification email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, un nouvel email de vérification a été envoyé.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email déjà vérifié' },
        { status: 400 }
      );
    }

    // Delete old verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires: expiresAt,
        used: false,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log(`[RESEND_VERIFICATION] Email sent to ${user.email}`);
    } catch (emailError) {
      console.error('[RESEND_VERIFICATION] Failed to send email:', emailError);
      return NextResponse.json(
        {
          error: 'Erreur lors de l\'envoi de l\'email',
          details: 'Le service d\'email n\'est pas configuré. Contactez le support.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Un nouvel email de vérification a été envoyé.',
    });
  } catch (error) {
    console.error('[RESEND_VERIFICATION] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

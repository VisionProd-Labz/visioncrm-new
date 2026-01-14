import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(clientIp, 'register');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives d'inscription. Réessayez dans ${Math.ceil(
            (rateLimitResult.resetAt.getTime() - Date.now()) / 60000
          )} minute(s).`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    const body = await req.json();

    // Validate input
    const { name, email, password, tenantName, subdomain } = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Ce sous-domaine est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          subdomain,
          plan: 'FREE',
        },
      });

      // Create user with OWNER role (email not verified yet)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          tenantId: tenant.id,
          role: 'OWNER',
          emailVerified: null, // Not verified yet
        },
      });

      // Create email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expires: expiresAt,
          used: false,
        },
      });

      return { tenant, user, verificationToken };
    });

    // Send verification email (non-blocking)
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${result.verificationToken}`;

      await sendVerificationEmail({
        to: result.user.email,
        name: result.user.name,
        verificationUrl,
      });

      console.log(`Verification email sent to ${result.user.email}`);
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', emailError);
      // Account is still created, user can request a new verification email
    }

    return NextResponse.json({
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      tenant: result.tenant,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}

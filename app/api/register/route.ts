import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/auth';
import { ApiErrors, handleApiError } from '@/lib/api/error-handler';
import { sendVerificationEmail } from '@/lib/email/email-service';
import { z } from 'zod';
import crypto from 'crypto';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères'),
  tenantName: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  subdomain: z.string()
    .min(3, 'Le sous-domaine doit contenir au moins 3 caractères')
    .max(63, 'Le sous-domaine doit contenir au plus 63 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le sous-domaine ne peut contenir que des lettres minuscules, chiffres et tirets'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, password, tenantName, subdomain } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiErrors.BadRequest('Cet email est déjà utilisé');
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      throw ApiErrors.BadRequest('Ce sous-domaine est déjà utilisé');
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          subdomain,
          plan: 'FREE',
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          tenantId: tenant.id,
          role: 'OWNER',
          emailVerified: null,
        },
      });

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

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

    try {
      await sendVerificationEmail(result.user.email, result.verificationToken);
      console.log(`[REGISTER] Verification email sent to ${result.user.email}`);
    } catch (emailError) {
      console.error('[REGISTER] Failed to send verification email:', emailError);
    }

    return NextResponse.json({
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      email: result.user.email,
      requiresEmailVerification: true,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return handleApiError(error, {
      route: '/api/register',
      method: 'POST',
    });
  }
}

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

/**
 * POST /api/register
 * Create new tenant and user account
 *
 * PUBLIC ENDPOINT - No auth required
 * ✅ REFACTORED: Using centralized error handler
 * ✅ Rate limiting handled by middleware
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting is now handled by middleware (no duplicate logic needed)

    const body = await req.json();

    // Validate input
    const { name, email, password, tenantName, subdomain } = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiErrors.BadRequest('Cet email est déjà utilisé');
    }

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      throw ApiErrors.BadRequest('Ce sous-domaine est déjà utilisé');
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
      await sendVerificationEmail(result.user.email, result.verificationToken);
      console.log(`[REGISTER] Verification email sent to ${result.user.email}`);
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('[REGISTER] Failed to send verification email:', emailError);
      // Account is still created, user can request a new verification email
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

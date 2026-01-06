import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(clientIp, 'password_reset');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${Math.ceil(
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

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not (security)
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: expiresAt,
        used: false,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'VisionCRM <noreply@visioncrm.app>',
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe - VisionCRM',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Réinitialisation de mot de passe</h1>
                </div>
                <div class="content">
                  <p>Bonjour ${user.name},</p>

                  <p>Nous avons reçu une demande de réinitialisation de votre mot de passe VisionCRM.</p>

                  <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                  </div>

                  <p>Ou copiez ce lien dans votre navigateur :</p>
                  <p style="background: white; padding: 12px; border-radius: 4px; word-break: break-all;">
                    ${resetUrl}
                  </p>

                  <div class="warning">
                    <strong>⚠️ Important :</strong>
                    <ul>
                      <li>Ce lien expire dans <strong>1 heure</strong></li>
                      <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                      <li>Ne partagez jamais ce lien avec qui que ce soit</li>
                    </ul>
                  </div>

                  <div class="footer">
                    <p>© ${new Date().getFullYear()} VisionCRM - CRM pour garages automobiles</p>
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Continue anyway - don't reveal if email sending failed
    }

    return NextResponse.json({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

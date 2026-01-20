#!/usr/bin/env tsx

/**
 * Manually resend verification email to an existing unverified account
 * Usage: pnpm tsx scripts/resend-verification-manual.ts email@example.com
 */

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function resendVerification(email: string) {
  console.log(`\n${colors.bold}${colors.cyan}Resend Verification Email${colors.reset}\n`);

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`${colors.red}✗${colors.reset} User not found: ${email}`);
      return false;
    }

    console.log(`${colors.green}✓${colors.reset} User found: ${user.name} (${user.email})`);

    // Check if already verified
    if (user.emailVerified) {
      console.log(`${colors.yellow}⚠${colors.reset} Email already verified at: ${user.emailVerified}`);
      console.log(`User can login directly at: ${process.env.NEXTAUTH_URL}/login`);
      return true;
    }

    // Delete old tokens
    const deleted = await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    if (deleted.count > 0) {
      console.log(`${colors.cyan}ℹ${colors.reset} Deleted ${deleted.count} old verification token(s)`);
    }

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: expiresAt,
        used: false,
      },
    });

    console.log(`${colors.green}✓${colors.reset} New verification token created`);

    // Send email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    console.log(`${colors.cyan}ℹ${colors.reset} Sending verification email...`);

    const result = await resend.emails.send({
      from: 'VisionCRM <noreply@vision-crm.app>',
      to: email,
      subject: 'Vérifiez votre adresse email - VisionCRM',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
              }
              .info-box {
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bienvenue sur VisionCRM</h1>
              </div>
              <div class="content">
                <p>Bonjour ${user.name},</p>
                <p>Merci de vous être inscrit sur VisionCRM ! Pour finaliser la création de votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>

                <center>
                  <a href="${verificationUrl}" class="button">
                    Vérifier mon email
                  </a>
                </center>

                <div class="info-box">
                  <p><strong>⏱️ Ce lien expire dans 24 heures.</strong></p>
                  <p>Si vous n'avez pas créé de compte VisionCRM, vous pouvez ignorer cet email en toute sécurité.</p>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                  Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :<br>
                  <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`${colors.green}✓${colors.reset} Verification email sent!`);
    console.log(`${colors.cyan}ℹ${colors.reset} Email ID: ${result.id}`);
    console.log(`${colors.cyan}ℹ${colors.reset} Verification URL: ${verificationUrl}`);
    console.log(`\n${colors.green}✅ Success!${colors.reset} Check your inbox: ${email}`);

    return true;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error:`, error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Main
const email = process.argv[2];

if (!email) {
  console.log(`${colors.red}✗${colors.reset} Please provide an email address`);
  console.log(`\nUsage:`);
  console.log(`  ${colors.cyan}pnpm tsx scripts/resend-verification-manual.ts email@example.com${colors.reset}`);
  process.exit(1);
}

resendVerification(email).then(success => {
  process.exit(success ? 0 : 1);
});

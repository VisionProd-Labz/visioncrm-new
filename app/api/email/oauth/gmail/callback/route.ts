import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/oauth/gmail/callback
 * Handles Gmail OAuth callback
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // tenant_id
    const error = searchParams.get('error');

    // Handle user cancellation
    if (error === 'access_denied') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email?error=cancelled`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email?error=invalid_request`
      );
    }

    const tenantId = state;

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/oauth/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Get user email from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      throw new Error('Could not get user email');
    }

    // Check if account already exists
    const existing = await prisma.emailAccount.findFirst({
      where: {
        tenant_id: tenantId,
        email: data.email,
      },
    });

    if (existing) {
      // Update existing account
      await prisma.emailAccount.update({
        where: { id: existing.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || existing.refresh_token, // Keep old refresh token if not provided
          expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          connected: true,
        },
      });
    } else {
      // Create new account
      await prisma.emailAccount.create({
        data: {
          tenant_id: tenantId,
          provider: 'GMAIL',
          email: data.email,
          name: data.email.split('@')[0] || 'Gmail',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          connected: true,
        },
      });
    }

    // Redirect back to email page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email?success=gmail_connected`
    );
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email?error=oauth_failed`
    );
  }
}

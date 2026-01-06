import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getCurrentTenantId } from '@/lib/tenant';

/**
 * GET /api/email/oauth/gmail/authorize
 * Initiates Gmail OAuth flow
 */
export async function GET(req: Request) {
  try {
    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: 'Configuration OAuth manquante',
          message: 'Les identifiants Google OAuth ne sont pas configurés. Contactez l\'administrateur.'
        },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/oauth/gmail/callback`
    );

    // Generate OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: [
        'https://www.googleapis.com/auth/gmail.send', // Send emails
        'https://www.googleapis.com/auth/userinfo.email', // Get user email
      ],
      state: tenantId, // Pass tenant ID for callback
      prompt: 'consent', // Force consent to get refresh token
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Gmail OAuth authorize error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'autorisation Gmail' },
      { status: 500 }
    );
  }
}

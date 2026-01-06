import { prisma } from './prisma';
import { Resend } from 'resend';
import { google } from 'googleapis';

/**
 * Send email using configured email account
 */
export async function sendEmailViaAccount(params: {
  tenantId: string;
  to: string;
  subject: string;
  html: string;
  from?: string; // Optional: specify which account to use
}) {
  const { tenantId, to, subject, html, from } = params;

  // Find configured email account
  const emailAccount = await prisma.emailAccount.findFirst({
    where: {
      tenant_id: tenantId,
      connected: true,
      ...(from ? { email: from } : {}), // Use specific account if provided
    },
    orderBy: { created_at: 'desc' }, // Use most recent if not specified
  });

  if (!emailAccount) {
    throw new Error(
      'Aucun compte email configuré. Allez dans Paramètres → Email pour configurer un compte.'
    );
  }

  // Send email based on provider
  switch (emailAccount.provider) {
    case 'RESEND':
      return await sendViaResend(emailAccount, to, subject, html);

    case 'GMAIL':
      return await sendViaGmail(emailAccount, to, subject, html);

    case 'OUTLOOK':
      throw new Error('Outlook OAuth non encore implémenté');

    case 'SMTP':
      return await sendViaSMTP(emailAccount, to, subject, html);

    default:
      throw new Error(`Provider non supporté: ${emailAccount.provider}`);
  }
}

/**
 * Send via Resend
 */
async function sendViaResend(
  account: any,
  to: string,
  subject: string,
  html: string
) {
  if (!account.access_token) {
    throw new Error('Clé API Resend manquante');
  }

  const resend = new Resend(account.access_token);

  const result = await resend.emails.send({
    from: `${account.name} <${account.email}>`,
    to: [to],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(`Erreur Resend: ${result.error.message}`);
  }

  return result;
}

/**
 * Send via Gmail API
 */
async function sendViaGmail(
  account: any,
  to: string,
  subject: string,
  html: string
) {
  if (!account.access_token) {
    throw new Error('Token d\'accès Gmail manquant');
  }

  // Check if token is expired and refresh if needed
  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    if (!account.refresh_token) {
      throw new Error('Token Gmail expiré. Veuillez reconnecter votre compte.');
    }

    // Refresh the token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/oauth/gmail/callback`
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update token in database
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    });

    account.access_token = credentials.access_token;
  }

  // Set up OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
  });

  // Create Gmail API client
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Create email in RFC 2822 format
  const email = [
    `From: ${account.name} <${account.email}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\n');

  // Encode email in base64url
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send email
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
    },
  });

  return result.data;
}

/**
 * Send via SMTP (to be implemented)
 */
async function sendViaSMTP(
  account: any,
  to: string,
  subject: string,
  html: string
) {
  // TODO: Implement SMTP using nodemailer
  throw new Error('SMTP non encore implémenté');
}

/**
 * Check if tenant has email configured
 */
export async function hasEmailConfigured(tenantId: string): Promise<boolean> {
  const count = await prisma.emailAccount.count({
    where: {
      tenant_id: tenantId,
      connected: true,
    },
  });

  return count > 0;
}

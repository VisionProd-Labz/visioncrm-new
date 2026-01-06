import { Resend } from 'resend';

// Initialize Resend only if API key is configured
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendInvitationEmailParams {
  email: string;
  inviterName: string;
  companyName: string;
  role: string;
  invitationUrl: string;
}

export async function sendInvitationEmail({
  email,
  inviterName,
  companyName,
  role,
  invitationUrl,
}: SendInvitationEmailParams) {
  // Check if email service is configured
  if (!resend) {
    throw new Error('Email service not configured. Please set RESEND_API_KEY in environment variables.');
  }

  const roleLabels: Record<string, string> = {
    OWNER: 'Propriétaire',
    MANAGER: 'Manager',
    ACCOUNTANT: 'Comptable',
    USER: 'Employé',
  };

  const roleLabel = roleLabels[role] || role;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'VisionCRM <noreply@visioncrm.app>',
      to: [email],
      subject: `Invitation à rejoindre ${companyName} sur VisionCRM`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation VisionCRM</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Vous êtes invité !</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonjour,
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${inviterName}</strong> vous invite à rejoindre <strong>${companyName}</strong> sur VisionCRM en tant que <strong>${roleLabel}</strong>.
    </p>

    <p style="font-size: 16px; margin-bottom: 30px;">
      VisionCRM est une plateforme CRM intelligente qui vous permettra de gérer vos clients, véhicules, devis, factures et bien plus encore.
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
        Accepter l'invitation
      </a>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        💡 <strong>Note :</strong> Cette invitation est valable pendant 7 jours. Vous devrez créer un compte avec cet email pour rejoindre l'équipe.
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} VisionCRM. Tous droits réservés.<br />
      Cet email a été envoyé à ${email}
    </p>
  </div>
</body>
</html>
      `,
      text: `
Invitation à rejoindre ${companyName} sur VisionCRM

Bonjour,

${inviterName} vous invite à rejoindre ${companyName} sur VisionCRM en tant que ${roleLabel}.

VisionCRM est une plateforme CRM intelligente qui vous permettra de gérer vos clients, véhicules, devis, factures et bien plus encore.

Pour accepter l'invitation, cliquez sur le lien ci-dessous ou copiez-le dans votre navigateur :

${invitationUrl}

Note : Cette invitation est valable pendant 7 jours. Vous devrez créer un compte avec cet email pour rejoindre l'équipe.

Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.

---
© ${new Date().getFullYear()} VisionCRM. Tous droits réservés.
Cet email a été envoyé à ${email}
      `,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

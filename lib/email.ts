import { Resend } from 'resend';

// Initialize Resend only if API key is configured
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'VisionCRM <noreply@visioncrm.app>';

/**
 * Check if email service is configured
 */
function checkEmailConfig(): void {
  if (!resend) {
    throw new Error('Email service not configured. Please set RESEND_API_KEY in environment variables.');
  }
}

/**
 * Send quote email
 */
export async function sendQuoteEmail(params: {
  to: string;
  contactName: string;
  quoteNumber: string;
  quoteId: string;
  total: number;
}) {
  checkEmailConfig();

  const { data, error } = await resend!.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Devis ${params.quoteNumber} - VisionCRM`,
    html: `
      <h1>Bonjour ${params.contactName},</h1>
      <p>Veuillez trouver ci-joint votre devis n°${params.quoteNumber}.</p>
      <p><strong>Montant total : ${params.total}€</strong></p>
      <p><a href="${process.env.NEXTAUTH_URL}/quotes/${params.quoteId}">Voir le devis</a></p>
      <br/>
      <p>Cordialement,<br/>L'équipe VisionCRM</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(params: {
  to: string;
  contactName: string;
  invoiceNumber: string;
  invoiceId: string;
  total: number;
  dueDate: string;
}) {
  checkEmailConfig();

  const { data, error } = await resend!.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Facture ${params.invoiceNumber} - VisionCRM`,
    html: `
      <h1>Bonjour ${params.contactName},</h1>
      <p>Veuillez trouver ci-joint votre facture n°${params.invoiceNumber}.</p>
      <p><strong>Montant total : ${params.total}€</strong></p>
      <p>Date d'échéance : ${params.dueDate}</p>
      <p><a href="${process.env.NEXTAUTH_URL}/invoices/${params.invoiceId}">Voir la facture</a></p>
      <br/>
      <p>Cordialement,<br/>L'équipe VisionCRM</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  tenantName: string;
}) {
  checkEmailConfig();

  const { data, error } = await resend!.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: 'Bienvenue sur VisionCRM !',
    html: `
      <h1>Bienvenue ${params.name} !</h1>
      <p>Votre compte VisionCRM pour <strong>${params.tenantName}</strong> a été créé avec succès.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard">Accéder au dashboard</a></p>
      <br/>
      <p>Besoin d'aide ? Consultez notre <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a>.</p>
      <br/>
      <p>L'équipe VisionCRM</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  verificationUrl: string;
}) {
  checkEmailConfig();

  const { data, error } = await resend!.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: 'Vérifiez votre adresse email - VisionCRM',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification Email VisionCRM</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Vérifiez votre email</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonjour ${params.name},
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Merci de vous être inscrit sur VisionCRM ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${params.verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
        Vérifier mon email
      </a>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong>Note :</strong> Ce lien de vérification expire dans 24 heures. Si vous n'avez pas créé de compte VisionCRM, vous pouvez ignorer cet email en toute sécurité.
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br />
      <a href="${params.verificationUrl}" style="color: #667eea; word-break: break-all;">${params.verificationUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} VisionCRM. Tous droits réservés.<br />
      Cet email a été envoyé à ${params.to}
    </p>
  </div>
</body>
</html>
    `,
    text: `
Vérifiez votre adresse email - VisionCRM

Bonjour ${params.name},

Merci de vous être inscrit sur VisionCRM ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :

${params.verificationUrl}

Note : Ce lien de vérification expire dans 24 heures. Si vous n'avez pas créé de compte VisionCRM, vous pouvez ignorer cet email en toute sécurité.

---
© ${new Date().getFullYear()} VisionCRM. Tous droits réservés.
Cet email a été envoyé à ${params.to}
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export default resend;

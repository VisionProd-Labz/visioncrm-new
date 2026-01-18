import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'VisionCRM <noreply@visioncrm.app>',
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
              .content p {
                margin: 0 0 20px;
                font-size: 16px;
                color: #555;
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
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
              }
              .footer p {
                margin: 5px 0;
              }
              .info-box {
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-box p {
                margin: 0;
                font-size: 14px;
                color: #555;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bienvenue sur VisionCRM</h1>
              </div>
              <div class="content">
                <p>Bonjour,</p>
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
              <div class="footer">
                <p><strong>VisionCRM</strong> - Votre CRM multi-tenant</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[EMAIL_SERVICE] Verification email sent to ${email}`);
  } catch (error) {
    console.error('[EMAIL_SERVICE] Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'VisionCRM <noreply@visioncrm.app>',
      to: email,
      subject: 'Réinitialisez votre mot de passe - VisionCRM',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
              .content p {
                margin: 0 0 20px;
                font-size: 16px;
                color: #555;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
              }
              .warning-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning-box p {
                margin: 0;
                font-size: 14px;
                color: #856404;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Réinitialisation du mot de passe</h1>
              </div>
              <div class="content">
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe VisionCRM. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                <center>
                  <a href="${resetUrl}" class="button">
                    Réinitialiser mon mot de passe
                  </a>
                </center>

                <div class="warning-box">
                  <p><strong>⏱️ Ce lien expire dans 1 heure.</strong></p>
                  <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                  Si le bouton ne fonctionne pas, copiez ce lien :<br>
                  <a href="${resetUrl}" style="color: #f5576c; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              <div class="footer">
                <p><strong>VisionCRM</strong> - Votre CRM multi-tenant</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[EMAIL_SERVICE] Password reset email sent to ${email}`);
  } catch (error) {
    console.error('[EMAIL_SERVICE] Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

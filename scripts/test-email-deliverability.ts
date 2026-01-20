#!/usr/bin/env tsx
/**
 * Script de test de délivrabilité email avec Resend
 *
 * Usage:
 * 1. Aller sur https://www.mail-tester.com/
 * 2. Copier l'adresse email unique (ex: test-abc123@mail-tester.com)
 * 3. Remplacer TEST_EMAIL ci-dessous
 * 4. Exécuter: npx tsx scripts/test-email-deliverability.ts
 * 5. Retourner sur mail-tester.com et vérifier le score
 *
 * Target: Score > 8/10
 */

import { Resend } from 'resend';

// ⚠️ REMPLACER avec l'adresse email de mail-tester.com
const TEST_EMAIL = 'test-abc123@mail-tester.com';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailDeliverability() {
  console.log('\n🚀 VisionCRM - Test Email Deliverability\n');
  console.log('📧 Domaine: vision-crm.app');
  console.log('📮 Service: Resend');
  console.log(`📬 Destinataire: ${TEST_EMAIL}\n`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Erreur: RESEND_API_KEY non configuré dans .env.local');
    console.log('\n💡 Solution:');
    console.log('1. Créer compte sur https://resend.com');
    console.log('2. Copier API Key (commence par re_...)');
    console.log('3. Ajouter dans .env.local: RESEND_API_KEY=re_xxxxx\n');
    process.exit(1);
  }

  if (TEST_EMAIL === 'test-abc123@mail-tester.com') {
    console.error('❌ Erreur: Vous devez remplacer TEST_EMAIL dans le script');
    console.log('\n💡 Instructions:');
    console.log('1. Aller sur https://www.mail-tester.com/');
    console.log('2. Copier l\'adresse email unique affichée');
    console.log('3. Éditer scripts/test-email-deliverability.ts');
    console.log('4. Remplacer TEST_EMAIL par votre adresse mail-tester\n');
    process.exit(1);
  }

  try {
    console.log('📤 Envoi de l\'email de test...\n');

    const { data, error } = await resend.emails.send({
      from: 'VisionCRM <noreply@vision-crm.app>',
      to: TEST_EMAIL,
      subject: 'Test Email Deliverability - VisionCRM',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test VisionCRM</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f9fc;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #3b82f6; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        VisionCRM
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px; opacity: 0.9;">
                        Test de délivrabilité email
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 20px;">
                        Test Email Deliverability
                      </h2>

                      <p style="color: #555555; margin: 0 0 15px; font-size: 16px; line-height: 24px;">
                        Ceci est un email de test pour vérifier la délivrabilité des emails envoyés depuis VisionCRM.
                      </p>

                      <p style="color: #555555; margin: 0 0 15px; font-size: 16px; line-height: 24px;">
                        Si vous recevez cet email, cela signifie que :
                      </p>

                      <ul style="color: #555555; margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 24px;">
                        <li>La configuration SPF est correcte ✅</li>
                        <li>La configuration DKIM fonctionne ✅</li>
                        <li>Le service Resend est opérationnel ✅</li>
                        <li>Le domaine vision-crm.app est vérifié ✅</li>
                      </ul>

                      <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 20px;">
                          <strong>📊 Score attendu:</strong> > 8/10 sur mail-tester.com
                        </p>
                      </div>

                      <p style="color: #555555; margin: 20px 0 0; font-size: 16px; line-height: 24px;">
                        Vérifiez votre score sur <a href="https://www.mail-tester.com" style="color: #3b82f6; text-decoration: none;">mail-tester.com</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #8898aa; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                        © 2026 VisionCRM. Tous droits réservés.<br>
                        <a href="https://vision-crm.app" style="color: #3b82f6; text-decoration: none;">vision-crm.app</a>
                        |
                        <a href="https://vision-crm.app/legal/privacy-policy" style="color: #3b82f6; text-decoration: none;">Politique de confidentialité</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
VisionCRM - Test Email Deliverability

Ceci est un email de test pour vérifier la délivrabilité.

Si vous recevez cet email, la configuration SPF/DKIM fonctionne correctement.

Score attendu: > 8/10 sur mail-tester.com

© 2026 VisionCRM. Tous droits réservés.
https://vision-crm.app
      `.trim(),
    });

    if (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      process.exit(1);
    }

    console.log('✅ Email envoyé avec succès!\n');
    console.log('📧 Email ID:', data?.id);
    console.log('\n📊 Prochaines étapes:\n');
    console.log('1. Retournez sur https://www.mail-tester.com/');
    console.log('2. Cliquez sur "Then check your score"');
    console.log('3. Attendez quelques secondes...');
    console.log('4. Vérifiez que le score est > 8/10\n');
    console.log('🎯 Si score < 8/10:');
    console.log('   - Vérifier SPF record dans Vercel DNS');
    console.log('   - Vérifier DKIM record (depuis Resend)');
    console.log('   - Ajouter DMARC record recommandé');
    console.log('   - Voir docs/deployment/EMAIL_DELIVERABILITY.md\n');

    // Afficher résumé configuration
    console.log('📋 Configuration actuelle:');
    console.log(`   • Domaine: vision-crm.app`);
    console.log(`   • From: VisionCRM <noreply@vision-crm.app>`);
    console.log(`   • Service: Resend`);
    console.log(`   • API Key: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
    console.log('');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Exécution
testEmailDeliverability()
  .then(() => {
    console.log('✅ Test terminé!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

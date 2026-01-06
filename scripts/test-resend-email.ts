#!/usr/bin/env tsx

/**
 * Resend Email Test Script
 * Envoie un email de test pour vérifier l'intégration Resend
 */

// import { config } from 'dotenv';
import { join } from 'path';

// config({ path: join(process.cwd(), '.env') });

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printHeader(text: string) {
  console.log(`\n${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log('='.repeat(text.length));
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${text}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

async function sendTestEmail(toEmail: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    printError('RESEND_API_KEY not configured');
    return false;
  }

  printInfo(`Sending test email to: ${toEmail}`);
  printInfo(`From: ${fromEmail}`);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: '✅ VisionCRM - Test Email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">VisionCRM</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Test Email</p>
              </div>

              <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">✅ Email Test Successful!</h2>

                <p>This is a test email from your VisionCRM application.</p>

                <p><strong>Configuration verified:</strong></p>
                <ul>
                  <li>✓ RESEND_API_KEY configured</li>
                  <li>✓ Email service functional</li>
                  <li>✓ HTML templates rendering correctly</li>
                </ul>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>From:</strong> ${fromEmail}<br>
                    <strong>Time:</strong> ${new Date().toLocaleString('fr-FR')}<br>
                    <strong>Status:</strong> <span style="color: #10b981;">Delivered</span>
                  </p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  VisionCRM - AI-powered CRM for French automotive garages<br>
                  This is an automated test email.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `
VisionCRM - Test Email

✅ Email Test Successful!

This is a test email from your VisionCRM application.

Configuration verified:
- RESEND_API_KEY configured
- Email service functional
- HTML templates rendering correctly

From: ${fromEmail}
Time: ${new Date().toLocaleString('fr-FR')}
Status: Delivered

VisionCRM - AI-powered CRM for French automotive garages
This is an automated test email.
        `,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      printSuccess(`Email sent successfully!`);
      printInfo(`  Email ID: ${data.id}`);
      printInfo(`  Check your inbox at: ${toEmail}`);
      return true;
    } else {
      const error = await response.json();
      printError(`Failed to send email: ${response.status}`);
      console.error(`  Error details:`, error);

      if (response.status === 403) {
        printWarning('  Possible issue: Domain not verified in Resend dashboard');
        printInfo('  You may need to verify your domain or use the default onboarding@resend.dev');
      }

      return false;
    }
  } catch (error) {
    printError(`Failed to send email: ${error}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n');
  printHeader('📧 VisionCRM - Resend Email Test');

  // Get email from command line argument or use default
  const testEmail = process.argv[2];

  if (!testEmail) {
    printError('Please provide an email address');
    console.log('\nUsage:');
    console.log(`  ${colors.cyan}pnpm tsx scripts/test-resend-email.ts your@email.com${colors.reset}`);
    console.log('\nExample:');
    console.log(`  ${colors.cyan}pnpm tsx scripts/test-resend-email.ts john@example.com${colors.reset}`);
    process.exit(1);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmail)) {
    printError(`Invalid email format: ${testEmail}`);
    process.exit(1);
  }

  printInfo(`Testing Resend integration...`);
  const success = await sendTestEmail(testEmail);

  if (success) {
    console.log('\n');
    printSuccess('Resend integration test passed!');
    console.log('\n🎉 Email service is working correctly!');
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log('1. Check your inbox (and spam folder)');
    console.log('2. Verify the email looks correct');
    console.log('3. If using a custom domain, ensure it\'s verified in Resend dashboard');
    process.exit(0);
  } else {
    console.log('\n');
    printError('Resend integration test failed');
    console.log('\n⚠️  Please check:');
    console.log('1. RESEND_API_KEY is correct in .env');
    console.log('2. API key has proper permissions');
    console.log('3. Domain is verified (if using custom domain)');
    console.log('4. Email address is valid');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

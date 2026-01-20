#!/usr/bin/env tsx

/**
 * Check email configuration
 * Verifies that RESEND_API_KEY is configured and tests email sending
 */

import 'dotenv/config';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${text}`);
}

async function checkConfiguration() {
  console.log(`\n${colors.bold}${colors.cyan}Email Configuration Check${colors.reset}\n`);

  // Check RESEND_API_KEY
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    printError('RESEND_API_KEY is NOT configured');
    console.log('\nTo fix this:');
    console.log('1. Go to https://resend.com/api-keys');
    console.log('2. Create an API key');
    console.log('3. Add to Vercel: Settings → Environment Variables');
    console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxx');
    return false;
  }

  printSuccess(`RESEND_API_KEY is configured (${apiKey.substring(0, 10)}...)`);

  // Check NEXTAUTH_URL
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    printSuccess(`NEXTAUTH_URL: ${nextAuthUrl}`);
  } else {
    printError('NEXTAUTH_URL is NOT configured');
  }

  // Test sending email
  printInfo('\nTesting Resend API...');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VisionCRM <noreply@vision-crm.app>',
        to: ['delivered@resend.dev'], // Resend test email
        subject: '✅ Test - VisionCRM Email Configuration',
        html: '<p>This is a test email to verify Resend configuration.</p>',
      }),
    });

    const result = await response.json();

    if (response.ok) {
      printSuccess('Email API test successful!');
      printInfo(`Email ID: ${result.id}`);
      console.log('\n✅ Email configuration is correct!');
      console.log('Emails should be sent successfully in production.');
      return true;
    } else {
      printError(`Email API test failed: ${response.status}`);
      console.log('Error details:', result);

      if (response.status === 403) {
        console.log('\n⚠️  Domain verification issue:');
        console.log('1. Check that vision-crm.app is verified in Resend dashboard');
        console.log('2. Ensure DNS records (DKIM, SPF, MX) are correctly configured');
        console.log('3. Wait a few minutes after adding DNS records');
      }

      return false;
    }
  } catch (error) {
    printError(`Network error: ${error}`);
    return false;
  }
}

checkConfiguration().then(success => {
  process.exit(success ? 0 : 1);
});

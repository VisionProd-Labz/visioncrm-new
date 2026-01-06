#!/usr/bin/env tsx

/**
 * API Integrations Test Script
 * Teste les connexions aux services externes (Resend, Stripe, etc.)
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

// Test Resend Email Service
async function testResend(): Promise<boolean> {
  printInfo('Testing Resend Email API...');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    printError('RESEND_API_KEY not configured');
    return false;
  }

  try {
    // Test API key by fetching domains
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      printSuccess(`Resend API connected (${data.data?.length || 0} domains configured)`);
      return true;
    } else {
      const error = await response.text();
      printError(`Resend API error: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    printError(`Resend connection failed: ${error}`);
    return false;
  }
}

// Test Stripe Payment Service
async function testStripe(): Promise<boolean> {
  printInfo('Testing Stripe API...');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    printError('STRIPE_SECRET_KEY not configured');
    return false;
  }

  try {
    // Test by retrieving account info
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      printSuccess(`Stripe API connected (Account: ${data.id})`);
      printInfo(`  Mode: ${secretKey.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
      return true;
    } else {
      const error = await response.text();
      printError(`Stripe API error: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    printError(`Stripe connection failed: ${error}`);
    return false;
  }
}

// Test Database Connection
async function testDatabase(): Promise<boolean> {
  printInfo('Testing Database connection...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    printError('DATABASE_URL not configured');
    return false;
  }

  try {
    // Try to import and use Prisma
    const { prisma } = await import('../lib/prisma');

    // Test with a simple query
    await prisma.$queryRaw`SELECT 1`;

    printSuccess('Database connection successful');
    return true;
  } catch (error) {
    printError(`Database connection failed: ${error}`);
    return false;
  }
}

// Test Google Gemini AI (if configured)
async function testGemini(): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    printInfo('GEMINI_API_KEY not configured (optional)');
    return true; // Optional service
  }

  printInfo('Testing Google Gemini AI API...');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Hello' }],
            },
          ],
        }),
      }
    );

    if (response.ok) {
      printSuccess('Gemini AI API connected');
      return true;
    } else {
      const error = await response.text();
      printError(`Gemini API error: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    printError(`Gemini connection failed: ${error}`);
    return false;
  }
}

// Test Redis (if configured)
async function testRedis(): Promise<boolean> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    printInfo('Redis not configured (optional - rate limiting will use fallback)');
    return true; // Optional service
  }

  printInfo('Testing Upstash Redis...');

  try {
    const response = await fetch(`${redisUrl}/ping`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result === 'PONG') {
        printSuccess('Redis connection successful');
        return true;
      }
    }

    printError('Redis connection failed');
    return false;
  } catch (error) {
    printError(`Redis connection failed: ${error}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n');
  console.log(
    `${colors.bold}${colors.cyan}🧪 VisionCRM - API Integrations Test${colors.reset}`
  );
  console.log('='.repeat(60));

  const results: { [key: string]: boolean } = {};

  // Test required services
  printHeader('🔴 Required Services');
  results.database = await testDatabase();
  results.resend = await testResend();
  results.stripe = await testStripe();

  // Test optional services
  printHeader('🟡 Optional Services');
  results.gemini = await testGemini();
  results.redis = await testRedis();

  // Summary
  printHeader('📊 Test Summary');

  const required = ['database', 'resend', 'stripe'];
  const optional = ['gemini', 'redis'];

  const requiredPassed = required.filter((key) => results[key]).length;
  const requiredTotal = required.length;

  const optionalPassed = optional.filter((key) => results[key]).length;
  const optionalTotal = optional.length;

  console.log(`\nRequired Services: ${requiredPassed}/${requiredTotal} passed`);
  console.log(`Optional Services: ${optionalPassed}/${optionalTotal} passed`);

  if (requiredPassed === requiredTotal) {
    printSuccess('All required integrations working!');
    console.log('\n🚀 Ready for production!');
    process.exit(0);
  } else {
    printError(`${requiredTotal - requiredPassed} required integration(s) failing`);
    console.log('\n⚠️  Please fix failing integrations before deploying.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

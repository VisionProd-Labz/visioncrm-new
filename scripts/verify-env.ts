#!/usr/bin/env tsx

/**
 * Environment Variables Verification Script
 * Vérifie que toutes les variables d'environnement requises sont configurées
 */

// import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
// config({ path: join(process.cwd(), '.env') });

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  category: 'database' | 'auth' | 'ai' | 'payment' | 'email' | 'monitoring' | 'features';
  validateFormat?: (value: string) => boolean;
}

const ENV_VARS: EnvVar[] = [
  // Database
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string (Supabase)',
    category: 'database',
    validateFormat: (v) => v.startsWith('postgresql://'),
  },

  // Authentication
  {
    key: 'NEXTAUTH_URL',
    required: true,
    description: 'Base URL of the application',
    category: 'auth',
    validateFormat: (v) => v.startsWith('http'),
  },
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secret for NextAuth.js session encryption',
    category: 'auth',
    validateFormat: (v) => v.length >= 32,
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    required: false,
    description: 'Google OAuth Client ID',
    category: 'auth',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    required: false,
    description: 'Google OAuth Client Secret',
    category: 'auth',
  },

  // AI - Gemini
  {
    key: 'GEMINI_API_KEY',
    required: false,
    description: 'Google Gemini AI API Key',
    category: 'ai',
    validateFormat: (v) => v.startsWith('AIza'),
  },

  // Payments - Stripe
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe Secret Key',
    category: 'payment',
    validateFormat: (v) => v.startsWith('sk_'),
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe Webhook Signing Secret',
    category: 'payment',
    validateFormat: (v) => v.startsWith('whsec_'),
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe Publishable Key (client-side)',
    category: 'payment',
    validateFormat: (v) => v.startsWith('pk_'),
  },

  // Email - Resend
  {
    key: 'RESEND_API_KEY',
    required: true,
    description: 'Resend Email API Key',
    category: 'email',
    validateFormat: (v) => v.startsWith('re_'),
  },
  {
    key: 'RESEND_FROM_EMAIL',
    required: false,
    description: 'From email address for Resend',
    category: 'email',
    validateFormat: (v) => v.includes('@'),
  },

  // OCR - Google Cloud Vision
  {
    key: 'GOOGLE_CLOUD_PROJECT_ID',
    required: false,
    description: 'Google Cloud Project ID for Vision API',
    category: 'features',
  },
  {
    key: 'GOOGLE_CLOUD_VISION_KEY',
    required: false,
    description: 'Google Cloud Vision API Key',
    category: 'features',
  },

  // Rate Limiting - Upstash Redis
  {
    key: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis REST URL',
    category: 'features',
    validateFormat: (v) => v.startsWith('https://'),
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis REST Token',
    category: 'features',
  },

  // Monitoring - Sentry
  {
    key: 'SENTRY_DSN',
    required: false,
    description: 'Sentry DSN (server-side)',
    category: 'monitoring',
    validateFormat: (v) => v.startsWith('https://'),
  },
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN (client-side)',
    category: 'monitoring',
    validateFormat: (v) => v.startsWith('https://'),
  },
  {
    key: 'SENTRY_ORG',
    required: false,
    description: 'Sentry Organization Slug',
    category: 'monitoring',
  },
  {
    key: 'SENTRY_PROJECT',
    required: false,
    description: 'Sentry Project Slug',
    category: 'monitoring',
  },
  {
    key: 'SENTRY_AUTH_TOKEN',
    required: false,
    description: 'Sentry Auth Token for source maps',
    category: 'monitoring',
  },
];

// Colors for terminal output
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

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${text}`);
}

interface VerificationResult {
  category: string;
  total: number;
  configured: number;
  required: number;
  requiredConfigured: number;
  issues: string[];
}

function verifyEnvironment(): Map<string, VerificationResult> {
  const results = new Map<string, VerificationResult>();
  let totalIssues = 0;

  // Initialize results by category
  const categories = [...new Set(ENV_VARS.map((v) => v.category))];
  categories.forEach((cat) => {
    results.set(cat, {
      category: cat,
      total: 0,
      configured: 0,
      required: 0,
      requiredConfigured: 0,
      issues: [],
    });
  });

  ENV_VARS.forEach((envVar) => {
    const result = results.get(envVar.category)!;
    result.total++;

    const value = process.env[envVar.key];
    const isConfigured = value && value.trim() !== '';

    if (envVar.required) {
      result.required++;
    }

    if (isConfigured) {
      result.configured++;

      // Validate format if validator provided
      if (envVar.validateFormat && !envVar.validateFormat(value!)) {
        const issue = `${envVar.key}: Invalid format`;
        result.issues.push(issue);
        printWarning(issue);
        totalIssues++;
      } else if (envVar.required) {
        result.requiredConfigured++;
      }
    } else {
      if (envVar.required) {
        const issue = `${envVar.key}: REQUIRED but not set`;
        result.issues.push(issue);
        printError(issue);
        totalIssues++;
      } else {
        printInfo(`${envVar.key}: Optional - not configured`);
      }
    }
  });

  return results;
}

function printCategorySummary(results: Map<string, VerificationResult>) {
  printHeader('📊 Summary by Category');

  results.forEach((result, category) => {
    const categoryName = category.toUpperCase();
    const requiredStatus =
      result.requiredConfigured === result.required
        ? `${colors.green}${result.requiredConfigured}/${result.required}${colors.reset}`
        : `${colors.red}${result.requiredConfigured}/${result.required}${colors.reset}`;

    console.log(
      `\n${colors.bold}${categoryName}${colors.reset} - Required: ${requiredStatus}, Total: ${result.configured}/${result.total}`
    );

    if (result.issues.length > 0) {
      result.issues.forEach((issue) => {
        console.log(`  ${colors.red}✗${colors.reset} ${issue}`);
      });
    } else if (result.requiredConfigured === result.required) {
      console.log(`  ${colors.green}✓${colors.reset} All required variables configured`);
    }
  });
}

function printOverallStatus(results: Map<string, VerificationResult>) {
  printHeader('🎯 Overall Status');

  let totalRequired = 0;
  let totalRequiredConfigured = 0;
  let totalConfigured = 0;
  let totalVars = 0;

  results.forEach((result) => {
    totalRequired += result.required;
    totalRequiredConfigured += result.requiredConfigured;
    totalConfigured += result.configured;
    totalVars += result.total;
  });

  console.log(`\nTotal Variables: ${totalConfigured}/${totalVars} configured`);
  console.log(`Required Variables: ${totalRequiredConfigured}/${totalRequired} configured`);

  if (totalRequiredConfigured === totalRequired) {
    printSuccess('All required environment variables are configured!');
    console.log('\n🚀 Ready for production!');
    return true;
  } else {
    printError(
      `Missing ${totalRequired - totalRequiredConfigured} required environment variable(s)`
    );
    console.log('\n⚠️  Please configure missing variables before deploying to production.');
    return false;
  }
}

function printDetailedList() {
  printHeader('📋 Detailed Environment Variables');

  const categorized = new Map<string, EnvVar[]>();

  ENV_VARS.forEach((envVar) => {
    if (!categorized.has(envVar.category)) {
      categorized.set(envVar.category, []);
    }
    categorized.get(envVar.category)!.push(envVar);
  });

  categorized.forEach((vars, category) => {
    console.log(`\n${colors.bold}${colors.cyan}${category.toUpperCase()}${colors.reset}`);
    vars.forEach((envVar) => {
      const value = process.env[envVar.key];
      const isConfigured = value && value.trim() !== '';
      const status = isConfigured
        ? `${colors.green}✓${colors.reset}`
        : envVar.required
        ? `${colors.red}✗${colors.reset}`
        : `${colors.yellow}○${colors.reset}`;

      const requiredLabel = envVar.required
        ? `${colors.red}[REQUIRED]${colors.reset}`
        : `${colors.yellow}[OPTIONAL]${colors.reset}`;

      console.log(`  ${status} ${envVar.key} ${requiredLabel}`);
      console.log(`     ${colors.blue}→${colors.reset} ${envVar.description}`);

      if (isConfigured && value) {
        const displayValue =
          value.length > 20 ? `${value.substring(0, 20)}...` : value;
        console.log(
          `     ${colors.blue}→${colors.reset} Current: ${colors.cyan}${displayValue}${colors.reset}`
        );
      }
    });
  });
}

// Main execution
function main() {
  console.log('\n');
  console.log(
    `${colors.bold}${colors.cyan}🔍 VisionCRM - Environment Variables Verification${colors.reset}`
  );
  console.log('='.repeat(60));

  // Check if .env file exists
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    printError('.env file not found!');
    console.log('\nPlease create a .env file with the required variables.');
    process.exit(1);
  }

  printSuccess('.env file found');

  // Verify all environment variables
  const results = verifyEnvironment();

  // Print summaries
  printCategorySummary(results);
  const isReady = printOverallStatus(results);

  // Print detailed list if requested
  if (process.argv.includes('--detailed')) {
    printDetailedList();
  } else {
    console.log(`\nRun with ${colors.cyan}--detailed${colors.reset} flag for full variable list.`);
  }

  console.log('\n');

  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

main();

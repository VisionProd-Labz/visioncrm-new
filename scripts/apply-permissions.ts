/**
 * Script to scan and apply permission checks to all API routes
 *
 * Usage:
 *   pnpm tsx scripts/apply-permissions.ts --scan     # Scan only (dry run)
 *   pnpm tsx scripts/apply-permissions.ts --apply    # Apply fixes
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Mapping de routes vers permissions
const ROUTE_PERMISSIONS: Record<string, {
  GET?: string;
  POST?: string;
  PATCH?: string | string[];
  PUT?: string | string[];
  DELETE?: string;
}> = {
  // Contacts
  'contacts/route.ts': {
    GET: 'view_contacts',
    POST: 'create_contacts',
  },
  'contacts/[id]/route.ts': {
    GET: 'view_contacts',
    PATCH: 'edit_contacts',
    DELETE: 'delete_contacts',
  },

  // Vehicles
  'vehicles/route.ts': {
    GET: 'view_vehicles',
    POST: 'create_vehicles',
  },
  'vehicles/[id]/route.ts': {
    GET: 'view_vehicles',
    PATCH: 'edit_vehicles',
    DELETE: 'delete_vehicles',
  },

  // Quotes
  'quotes/route.ts': {
    GET: 'view_quotes',
    POST: 'create_quotes',
  },
  'quotes/[id]/route.ts': {
    GET: 'view_quotes',
    PATCH: 'edit_quotes',
    DELETE: 'delete_quotes',
  },
  'quotes/[id]/convert/route.ts': {
    POST: 'create_invoices', // Convertir en facture
  },

  // Invoices
  'invoices/route.ts': {
    GET: 'view_invoices',
    POST: 'create_invoices',
  },
  'invoices/[id]/route.ts': {
    GET: 'view_invoices',
    PATCH: 'edit_invoices',
    DELETE: 'delete_invoices',
  },

  // Tasks
  'tasks/route.ts': {
    GET: 'view_tasks',
    POST: 'create_tasks',
  },
  'tasks/[id]/route.ts': {
    GET: 'view_tasks',
    PATCH: 'edit_tasks',
    DELETE: 'delete_tasks',
  },

  // Catalog
  'catalog/route.ts': {
    GET: 'view_catalog',
    POST: 'edit_catalog',
  },
  'catalog/[id]/route.ts': {
    GET: 'view_catalog',
    PATCH: 'edit_catalog',
    DELETE: 'edit_catalog',
  },

  // Planning/Events
  'planning/events/route.ts': {
    GET: 'view_planning',
    POST: 'edit_planning',
  },
  'planning/events/[id]/route.ts': {
    GET: 'view_planning',
    PATCH: 'edit_planning',
    DELETE: 'edit_planning',
  },

  // Communications
  'communications/conversations/route.ts': {
    GET: 'view_communications',
    POST: 'send_messages',
  },
  'communications/conversations/[id]/messages/route.ts': {
    GET: 'view_communications',
    POST: 'send_messages',
  },
  'communications/email/send/route.ts': {
    POST: 'send_emails',
  },

  // Email
  'email/accounts/route.ts': {
    GET: 'view_emails',
    POST: 'view_emails', // Setup only
  },
  'email/messages/route.ts': {
    GET: 'view_emails',
    POST: 'send_emails',
  },

  // Team
  'team/route.ts': {
    GET: 'view_team',
  },
  'team/[id]/route.ts': {
    GET: 'view_team',
    PATCH: 'edit_members',
    DELETE: 'remove_members',
  },
  'team/invitations/route.ts': {
    GET: 'view_team',
    POST: 'invite_members',
  },

  // Company
  'company/route.ts': {
    GET: 'view_company',
    PATCH: 'edit_company',
  },
  'company/documents/route.ts': {
    GET: 'view_company',
    POST: 'edit_company',
  },
  'company/documents/[id]/route.ts': {
    GET: 'view_company',
    DELETE: 'edit_company',
  },

  // Settings
  'settings/regional/route.ts': {
    GET: 'view_settings',
    PATCH: 'edit_settings',
  },
  'settings/vat-rates/route.ts': {
    GET: 'view_settings',
    POST: 'edit_settings',
  },
  'settings/vat-rates/[id]/route.ts': {
    GET: 'view_settings',
    PATCH: 'edit_settings',
    DELETE: 'edit_settings',
  },
  'settings/payment-terms/route.ts': {
    GET: 'view_settings',
    POST: 'edit_settings',
  },
  'settings/payment-terms/[id]/route.ts': {
    GET: 'view_settings',
    PATCH: 'edit_settings',
    DELETE: 'edit_settings',
  },
  'settings/payment-methods/route.ts': {
    GET: 'view_settings',
    POST: 'edit_settings',
  },
  'settings/payment-methods/[id]/route.ts': {
    GET: 'view_settings',
    PATCH: 'edit_settings',
    DELETE: 'edit_settings',
  },
  'settings/task-categories/route.ts': {
    GET: 'view_settings',
    POST: 'edit_settings',
  },
  'settings/task-categories/[id]/route.ts': {
    GET: 'view_settings',
    PATCH: 'edit_settings',
    DELETE: 'edit_settings',
  },

  // Accounting
  'accounting/bank-accounts/route.ts': {
    GET: 'view_bank_accounts',
    POST: 'create_bank_accounts',
  },
  'accounting/bank-accounts/[id]/route.ts': {
    GET: 'view_bank_accounts',
    PATCH: 'edit_bank_accounts',
    DELETE: 'delete_bank_accounts',
  },
  'accounting/transactions/route.ts': {
    GET: 'view_bank_transactions',
    POST: 'create_bank_transactions',
  },
  'accounting/expenses/route.ts': {
    GET: 'view_expenses',
    POST: 'create_expenses',
  },
  'accounting/expenses/[id]/route.ts': {
    GET: 'view_expenses',
    PATCH: 'edit_expenses',
    DELETE: 'delete_expenses',
  },
  'accounting/expenses/[id]/approve/route.ts': {
    POST: 'approve_expenses',
  },
  'accounting/reconciliation/route.ts': {
    GET: 'view_bank_accounts',
    POST: 'reconcile_bank_accounts',
  },
  'accounting/inventory/route.ts': {
    GET: 'view_inventory',
    POST: 'create_inventory',
  },
  'accounting/inventory/[id]/route.ts': {
    GET: 'view_inventory',
    PATCH: 'edit_inventory',
    DELETE: 'delete_inventory',
  },
  'accounting/documents/tax/route.ts': {
    GET: 'view_tax_documents',
    POST: 'upload_tax_documents',
  },
  'accounting/documents/payroll/route.ts': {
    GET: 'view_payroll',
    POST: 'upload_payroll',
  },
  'accounting/documents/legal/route.ts': {
    GET: 'view_legal_documents',
    POST: 'upload_legal_documents',
  },
  'accounting/litigation/route.ts': {
    GET: 'view_litigation',
    POST: 'create_litigation',
  },
  'accounting/litigation/[id]/route.ts': {
    GET: 'view_litigation',
    PATCH: 'edit_litigation',
    DELETE: 'delete_litigation',
  },
  'accounting/reports/route.ts': {
    GET: 'view_financial_reports',
    POST: 'generate_financial_reports',
  },

  // Dashboard
  'dashboard/stats/route.ts': {
    GET: 'view_dashboard',
  },

  // Projects
  'projects/route.ts': {
    GET: 'view_tasks', // Projects use same permissions as tasks
    POST: 'create_tasks',
  },
  'projects/[id]/route.ts': {
    GET: 'view_tasks',
    PATCH: 'edit_tasks',
    DELETE: 'delete_tasks',
  },

  // Admin
  'admin/audit-logs/route.ts': {
    GET: 'edit_settings', // Admin only
  },
  'admin/data-retention/route.ts': {
    GET: 'edit_settings',
    POST: 'edit_settings',
  },
};

// Routes qui ne nécessitent PAS de permissions (publiques ou auth uniquement)
const SKIP_ROUTES = [
  'auth/[...nextauth]/route.ts',
  'auth/verify-email/route.ts',
  'webhooks/stripe/route.ts',
  'invitations/accept/[token]/route.ts',
  'invitations/verify/[token]/route.ts',
  'rgpd/dsar/request/route.ts', // Accessible à tous
  'rgpd/consents/route.ts',
];

interface ScanResult {
  file: string;
  methods: string[];
  hasPermissions: boolean;
  missingPermissions: string[];
  status: 'ok' | 'missing' | 'skip' | 'unknown';
}

function extractHttpMethods(content: string): string[] {
  const methods: string[] = [];
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(/g;
  let match;

  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }

  return methods;
}

function hasPermissionCheck(content: string): boolean {
  return content.includes('requirePermission') ||
         content.includes('requireAuth') ||
         content.includes('requireRole');
}

function getRelativePath(fullPath: string): string {
  const apiIndex = fullPath.indexOf('api\\');
  if (apiIndex === -1) return fullPath;
  return fullPath.substring(apiIndex + 4).replace(/\\/g, '/');
}

async function scanRoutes(): Promise<ScanResult[]> {
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const routeFiles = await glob('**/route.ts', { cwd: apiDir });

  const results: ScanResult[] = [];

  for (const file of routeFiles) {
    const fullPath = path.join(apiDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const relativePath = file.replace(/\\/g, '/');

    const methods = extractHttpMethods(content);
    const hasPerms = hasPermissionCheck(content);

    const routeConfig = ROUTE_PERMISSIONS[relativePath];
    const shouldSkip = SKIP_ROUTES.includes(relativePath);

    let status: ScanResult['status'] = 'unknown';
    const missingPermissions: string[] = [];

    if (shouldSkip) {
      status = 'skip';
    } else if (hasPerms) {
      status = 'ok';
    } else if (routeConfig) {
      status = 'missing';
      // Identifier les permissions manquantes
      methods.forEach(method => {
        const perm = (routeConfig as any)[method];
        if (perm) {
          if (Array.isArray(perm)) {
            missingPermissions.push(...perm);
          } else {
            missingPermissions.push(perm);
          }
        }
      });
    } else {
      status = 'unknown';
    }

    results.push({
      file: relativePath,
      methods,
      hasPermissions: hasPerms,
      missingPermissions,
      status,
    });
  }

  return results;
}

function generateReport(results: ScanResult[]) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 PERMISSION SCAN REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const ok = results.filter(r => r.status === 'ok');
  const missing = results.filter(r => r.status === 'missing');
  const skip = results.filter(r => r.status === 'skip');
  const unknown = results.filter(r => r.status === 'unknown');

  console.log(`Total routes: ${results.length}`);
  console.log(`✅ Protected: ${ok.length}`);
  console.log(`🔴 Missing permissions: ${missing.length}`);
  console.log(`⚪ Skipped (public): ${skip.length}`);
  console.log(`❓ Unknown (needs mapping): ${unknown.length}\n`);

  if (missing.length > 0) {
    console.log('🔴 ROUTES MISSING PERMISSIONS:\n');
    missing.forEach(r => {
      console.log(`  ${r.file}`);
      console.log(`    Methods: ${r.methods.join(', ')}`);
      console.log(`    Missing: ${r.missingPermissions.join(', ')}`);
      console.log('');
    });
  }

  if (unknown.length > 0) {
    console.log('\n❓ ROUTES NEEDING PERMISSION MAPPING:\n');
    unknown.forEach(r => {
      console.log(`  ${r.file}`);
      console.log(`    Methods: ${r.methods.join(', ')}`);
      console.log('');
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`Security Score: ${Math.round((ok.length / (results.length - skip.length)) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || !['--scan', '--apply'].includes(mode)) {
    console.error('Usage: pnpm tsx scripts/apply-permissions.ts [--scan|--apply]');
    process.exit(1);
  }

  console.log('🔍 Scanning API routes...\n');

  const results = await scanRoutes();
  generateReport(results);

  if (mode === '--apply') {
    console.log('ℹ️  Apply mode not yet implemented');
    console.log('Please use the permission mapping table to manually add permissions');
    console.log('See: tests/security/VALIDATION_FIX3.md for instructions\n');
  } else {
    console.log('ℹ️  To apply fixes, run: pnpm tsx scripts/apply-permissions.ts --apply\n');
  }
}

main().catch(console.error);

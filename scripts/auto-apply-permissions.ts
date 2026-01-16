/**
 * Automatically apply permissions to API routes
 *
 * Usage: pnpm tsx scripts/auto-apply-permissions.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Permission mapping for routes
const PERMISSION_MAPPING: Record<string, Record<string, string>> = {
  // Vehicles
  'GET_vehicles': 'view_vehicles',
  'POST_vehicles': 'create_vehicles',
  'PATCH_vehicles': 'edit_vehicles',
  'DELETE_vehicles': 'delete_vehicles',

  // Contacts
  'GET_contacts': 'view_contacts',
  'POST_contacts': 'create_contacts',
  'PATCH_contacts': 'edit_contacts',
  'DELETE_contacts': 'delete_contacts',

  // Tasks
  'GET_tasks': 'view_tasks',
  'POST_tasks': 'create_tasks',
  'PATCH_tasks': 'edit_tasks',
  'DELETE_tasks': 'delete_tasks',

  // Quotes
  'GET_quotes': 'view_quotes',
  'POST_quotes': 'create_quotes',
  'PATCH_quotes': 'edit_quotes',
  'DELETE_quotes': 'delete_quotes',

  // Invoices
  'GET_invoices': 'view_invoices',
  'POST_invoices': 'create_invoices',
  'PATCH_invoices': 'edit_invoices',
  'DELETE_invoices': 'delete_invoices',

  // Projects
  'GET_projects': 'view_tasks',
  'POST_projects': 'create_tasks',
  'PATCH_projects': 'edit_tasks',
  'DELETE_projects': 'delete_tasks',

  // Team
  'GET_team': 'view_team',
  'POST_team': 'add_members',
  'PATCH_team': 'edit_members',
  'DELETE_team': 'remove_members',

  // Catalog
  'GET_catalog': 'view_catalog',
  'POST_catalog': 'edit_catalog',
  'PATCH_catalog': 'edit_catalog',
  'DELETE_catalog': 'edit_catalog',

  // Company
  'GET_company': 'view_company',
  'PATCH_company': 'edit_company',

  // Settings
  'GET_settings': 'view_settings',
  'POST_settings': 'edit_settings',
  'PATCH_settings': 'edit_settings',
  'DELETE_settings': 'edit_settings',

  // Dashboard
  'GET_dashboard': 'view_dashboard',

  // Planning
  'GET_planning': 'view_planning',
  'POST_planning': 'edit_planning',
  'PATCH_planning': 'edit_planning',
  'DELETE_planning': 'edit_planning',

  // Email
  'GET_email': 'view_emails',
  'POST_email': 'send_emails',

  // Communications
  'GET_communications': 'view_communications',
  'POST_communications': 'send_messages',

  // Accounting - Bank Accounts
  'GET_bank-accounts': 'view_bank_accounts',
  'POST_bank-accounts': 'create_bank_accounts',
  'PATCH_bank-accounts': 'edit_bank_accounts',
  'DELETE_bank-accounts': 'delete_bank_accounts',

  // Accounting - Transactions
  'GET_transactions': 'view_bank_transactions',
  'POST_transactions': 'create_bank_transactions',

  // Accounting - Expenses
  'GET_expenses': 'view_expenses',
  'POST_expenses': 'create_expenses',
  'PATCH_expenses': 'edit_expenses',
  'DELETE_expenses': 'delete_expenses',

  // Accounting - Inventory
  'GET_inventory': 'view_inventory',
  'POST_inventory': 'create_inventory',
  'PATCH_inventory': 'edit_inventory',
  'DELETE_inventory': 'delete_inventory',

  // Accounting - Litigation
  'GET_litigation': 'view_litigation',
  'POST_litigation': 'create_litigation',
  'PATCH_litigation': 'edit_litigation',
  'DELETE_litigation': 'delete_litigation',

  // Accounting - Reports
  'GET_reports': 'view_financial_reports',
  'POST_reports': 'generate_financial_reports',

  // Accounting - Reconciliation
  'GET_reconciliation': 'view_bank_accounts',
  'POST_reconciliation': 'reconcile_bank_accounts',

  // Accounting - Documents
  'GET_legal': 'view_legal_documents',
  'POST_legal': 'upload_legal_documents',
  'GET_tax': 'view_tax_documents',
  'POST_tax': 'upload_tax_documents',
  'GET_payroll': 'view_payroll',
  'POST_payroll': 'upload_payroll',

  // Admin
  'GET_admin': 'edit_settings',
  'POST_admin': 'edit_settings',
  'PATCH_admin': 'edit_settings',
};

function getPermission(method: string, routePath: string): string | null {
  // Normalize path (handle both Windows and Unix)
  const normalizedPath = routePath.replace(/\\/g, '/');

  // Extract route segment (e.g., "contacts", "vehicles", "bank-accounts")
  const segments = normalizedPath
    .split('/')
    .filter(s => s && !s.startsWith('[') && s !== 'api' && s !== 'route.ts' && s !== 'app');

  // Try to find permission mapping
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const key = `${method}_${segment}`;
    if (PERMISSION_MAPPING[key]) {
      return PERMISSION_MAPPING[key];
    }
  }

  return null;
}

function addPermissionCheck(content: string, method: string, permission: string): string {
  // Check if already has permission check
  if (content.includes('requirePermission')) {
    console.log('    ⏭️  Already has permission check');
    return content;
  }

  // Add import if not present
  if (!content.includes("from '@/lib/middleware/require-permission'")) {
    content = content.replace(
      /import { NextResponse } from 'next\/server';/,
      `import { NextResponse } from 'next/server';\nimport { requirePermission } from '@/lib/middleware/require-permission';`
    );
  }

  // Find the function declaration
  const functionRegex = new RegExp(`export async function ${method}\\(`, 'g');
  const match = functionRegex.exec(content);

  if (!match) {
    console.log(`    ⚠️  Could not find function ${method}`);
    return content;
  }

  // Find the opening brace and try block
  const startIndex = match.index;
  const openBraceIndex = content.indexOf('{', startIndex);
  const tryIndex = content.indexOf('try {', openBraceIndex);

  if (tryIndex === -1 || tryIndex - openBraceIndex > 50) {
    // No try block or too far
    console.log(`    ⚠️  No try block found for ${method}`);
    return content;
  }

  // Add permission check right after "try {"
  const insertIndex = tryIndex + 5; // after "try {"
  const permissionCheck = `
    // ✅ SECURITY FIX #3: Permission check
    const permError = await requirePermission('${permission}');
    if (permError) return permError;
`;

  content = content.slice(0, insertIndex) + permissionCheck + content.slice(insertIndex);

  return content;
}

async function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);

  console.log(`\n📄 ${relativePath}`);

  // Extract methods from file
  const methods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];
  let modified = content;
  let hasChanges = false;

  for (const method of methods) {
    const functionRegex = new RegExp(`export async function ${method}\\(`, 'g');
    if (functionRegex.test(content)) {
      const permission = getPermission(method, relativePath);

      if (permission) {
        console.log(`  ${method}: ${permission}`);
        const newContent = addPermissionCheck(modified, method, permission);
        if (newContent !== modified) {
          modified = newContent;
          hasChanges = true;
        }
      } else {
        console.log(`  ${method}: ⚠️  No permission mapping found`);
      }
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, modified, 'utf-8');
    console.log('  ✅ Updated');
    return 1;
  }

  return 0;
}

async function main() {
  console.log('🔧 Auto-applying permissions to API routes...\n');

  const apiDir = path.join(process.cwd(), 'app', 'api');
  const routeFiles = await glob('**/route.ts', {
    cwd: apiDir,
    absolute: true,
  });

  // Skip public routes
  const publicRoutes = [
    'auth',
    'webhooks',
    'invitations/accept',
    'rgpd/dsar/request',
  ];

  const filesToProcess = routeFiles.filter(file => {
    const relativePath = path.relative(apiDir, file);
    return !publicRoutes.some(pub => relativePath.startsWith(pub));
  });

  console.log(`Found ${filesToProcess.length} routes to process\n`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  let updatedCount = 0;

  for (const file of filesToProcess) {
    updatedCount += await processFile(file);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`\n✅ Complete! Updated ${updatedCount}/${filesToProcess.length} files\n`);
}

main().catch(console.error);

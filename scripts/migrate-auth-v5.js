const fs = require('fs');
const path = require('path');

// List of files to migrate
const files = [
  'app/api/communications/email/send/route.ts',
  'app/api/accounting/reports/route.ts',
  'app/api/accounting/litigation/route.ts',
  'app/api/accounting/litigation/[id]/route.ts',
  'app/api/accounting/inventory/[id]/route.ts',
  'app/api/accounting/expenses/route.ts',
  'app/api/accounting/expenses/[id]/route.ts',
  'app/api/accounting/documents/tax/route.ts',
  'app/api/accounting/documents/route.ts',
  'app/api/accounting/documents/payroll/route.ts',
  'app/api/accounting/documents/legal/route.ts',
  'app/api/projects/[id]/route.ts',
  'app/api/admin/data-retention/route.ts',
  'app/api/admin/audit-logs/route.ts',
  'app/api/rgpd/dsar/delete/route.ts',
  'app/api/rgpd/dsar/export/route.ts',
  'app/api/rgpd/dsar/requests/route.ts',
  'app/api/rgpd/dsar/request/route.ts',
  'app/api/rgpd/consents/route.ts',
  'app/api/accounting/expenses/[id]/approve/route.ts',
  'app/api/accounting/inventory/route.ts',
  'app/api/accounting/reconciliation/route.ts',
  'app/api/team/invite/route.ts',
  'app/api/team/[id]/route.ts',
  'app/api/settings/vat-rates/[id]/route.ts',
  'app/api/settings/task-categories/[id]/route.ts',
  'app/api/settings/payment-terms/[id]/route.ts',
  'app/api/settings/payment-methods/[id]/route.ts',
  'app/api/contacts/import/route.ts',
  'app/api/settings/regional/route.ts',
  'app/api/settings/payment-methods/route.ts',
  'app/api/settings/task-categories/route.ts',
  'app/api/settings/payment-terms/route.ts',
  'app/api/settings/vat-rates/route.ts',
  'app/api/team/invitations/route.ts',
  'app/api/register/route.ts',
  'app/api/auth/reset-password/route.ts',
];

console.log('🔄 Migration de l\'authentification vers Auth.js v5...\n');

let migrated = 0;
let skipped = 0;

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
    skipped++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace getServerSession import
  if (content.includes('getServerSession')) {
    content = content.replace(
      /import { getServerSession } from ['"]next-auth['"];?/g,
      "import { auth } from '@/auth';"
    );
    modified = true;
  }

  // Remove authOptions import
  if (content.includes('authOptions')) {
    content = content.replace(
      /import { authOptions } from ['"]@\/lib\/auth['"];?\n?/g,
      ''
    );
    modified = true;
  }

  // Replace getServerSession calls
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(
      /await getServerSession\(authOptions\)/g,
      'await auth()'
    );
    content = content.replace(
      /const session = getServerSession\(authOptions\)/g,
      'const session = await auth()'
    );
    modified = true;
  }

  // Replace session.user.tenantId with (session.user as any).tenantId
  if (content.includes('session.user.tenantId') || content.includes('session?.user?.tenantId')) {
    content = content.replace(
      /session\.user\.tenantId/g,
      '(session.user as any).tenantId'
    );
    content = content.replace(
      /session\?\.user\?\.tenantId/g,
      '(session.user as any).tenantId'
    );
    modified = true;
  }

  if (modified) {
    // Create backup
    fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));

    // Write modified content
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`✅ Migré: ${file}`);
    migrated++;
  } else {
    console.log(`⏭️  Aucune modification nécessaire: ${file}`);
    skipped++;
  }
});

console.log(`\n✅ Migration terminée: ${migrated} fichiers migrés, ${skipped} ignorés`);
console.log('\n📝 Les backups sont dans *.backup');
console.log('🔍 Vérifiez que tout fonctionne puis supprimez les backups avec:');
console.log('   find app/api -name "*.backup" -delete');

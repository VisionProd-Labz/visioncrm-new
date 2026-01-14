#!/bin/bash

# Script to migrate all API routes from NextAuth v4 to Auth.js v5

echo "🔄 Migration de l'authentification vers Auth.js v5..."
echo ""

# List of files to migrate
files=(
"app/api/communications/email/send/route.ts"
"app/api/accounting/reports/route.ts"
"app/api/accounting/litigation/route.ts"
"app/api/accounting/litigation/[id]/route.ts"
"app/api/accounting/inventory/[id]/route.ts"
"app/api/accounting/expenses/route.ts"
"app/api/accounting/expenses/[id]/route.ts"
"app/api/accounting/documents/tax/route.ts"
"app/api/accounting/documents/route.ts"
"app/api/accounting/documents/payroll/route.ts"
"app/api/accounting/documents/legal/route.ts"
"app/api/projects/[id]/route.ts"
"app/api/admin/data-retention/route.ts"
"app/api/admin/audit-logs/route.ts"
"app/api/rgpd/dsar/delete/route.ts"
"app/api/rgpd/dsar/export/route.ts"
"app/api/rgpd/dsar/requests/route.ts"
"app/api/rgpd/dsar/request/route.ts"
"app/api/rgpd/consents/route.ts"
"app/api/accounting/expenses/[id]/approve/route.ts"
"app/api/accounting/inventory/route.ts"
"app/api/accounting/reconciliation/route.ts"
"app/api/team/invite/route.ts"
"app/api/team/[id]/route.ts"
"app/api/settings/vat-rates/[id]/route.ts"
"app/api/settings/task-categories/[id]/route.ts"
"app/api/settings/payment-terms/[id]/route.ts"
"app/api/settings/payment-methods/[id]/route.ts"
"app/api/contacts/import/route.ts"
"app/api/settings/regional/route.ts"
"app/api/settings/payment-methods/route.ts"
"app/api/settings/task-categories/route.ts"
"app/api/settings/payment-terms/route.ts"
"app/api/settings/vat-rates/route.ts"
"app/api/team/invitations/route.ts"
"app/api/register/route.ts"
"app/api/auth/reset-password/route.ts"
)

count=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Backup
        cp "$file" "$file.backup"

        # Replace imports
        sed -i "s/import { getServerSession } from 'next-auth';/import { auth } from '@\/auth';/g" "$file"
        sed -i "s/import { getServerSession } from \"next-auth\";/import { auth } from '@\/auth';/g" "$file"

        # Remove authOptions import
        sed -i "/import { authOptions } from '@\/lib\/auth';/d" "$file"
        sed -i "/import { authOptions } from \"@\/lib\/auth\";/d" "$file"

        # Replace getServerSession calls
        sed -i "s/await getServerSession(authOptions)/await auth()/g" "$file"
        sed -i "s/const session = getServerSession(authOptions)/const session = await auth()/g" "$file"

        count=$((count + 1))
        echo "✅ Migré: $file"
    else
        echo "⚠️  Fichier non trouvé: $file"
    fi
done

echo ""
echo "✅ Migration terminée: $count fichiers migrés"
echo ""
echo "📝 Les backups sont dans *.backup"
echo "🔍 Vérifiez que tout fonctionne puis supprimez les backups"

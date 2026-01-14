/**
 * Purge Old Data Script
 *
 * This script purges old data based on data retention policies.
 * It should be run periodically via a cron job or scheduler.
 *
 * Usage:
 *   ts-node scripts/purge-old-data.ts
 *   or
 *   node -r ts-node/register scripts/purge-old-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PurgeStats {
  entityType: string;
  deleted: number;
  retentionDays: number;
}

/**
 * Main purge function
 */
async function purgeOldData(): Promise<PurgeStats[]> {
  console.log('🗑️  Starting data purge process...');
  const stats: PurgeStats[] = [];

  try {
    // Get all active retention policies
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { is_active: true },
    });

    console.log(`📋 Found ${policies.length} active retention policies`);

    for (const policy of policies) {
      console.log(`\n📦 Processing: ${policy.entity_type} (${policy.retention_days} days)`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

      let deletedCount = 0;

      // Apply purge based on entity type
      switch (policy.entity_type) {
        case 'contacts':
          // Soft delete contacts that haven't been updated in X days
          const contactsResult = await prisma.contact.updateMany({
            where: {
              tenant_id: policy.tenant_id,
              updated_at: { lt: cutoffDate },
              deleted_at: null,
            },
            data: {
              deleted_at: new Date(),
            },
          });
          deletedCount = contactsResult.count;
          break;

        case 'access_logs':
          // Hard delete old access logs
          const logsResult = await prisma.accessLog.deleteMany({
            where: {
              tenant_id: policy.tenant_id,
              created_at: { lt: cutoffDate },
            },
          });
          deletedCount = logsResult.count;
          break;

        case 'activities':
          // Hard delete old activities
          const activitiesResult = await prisma.activity.deleteMany({
            where: {
              tenant_id: policy.tenant_id,
              created_at: { lt: cutoffDate },
            },
          });
          deletedCount = activitiesResult.count;
          break;

        case 'documents':
          // Soft delete old documents
          const documentsResult = await prisma.document.updateMany({
            where: {
              tenant_id: policy.tenant_id,
              created_at: { lt: cutoffDate },
              deleted_at: null,
            },
            data: {
              deleted_at: new Date(),
            },
          });
          deletedCount = documentsResult.count;
          break;

        case 'invoices':
          // Soft delete old draft/cancelled invoices only
          const invoicesResult = await prisma.invoice.updateMany({
            where: {
              tenant_id: policy.tenant_id,
              updated_at: { lt: cutoffDate },
              status: { in: ['DRAFT', 'CANCELLED'] },
              deleted_at: null,
            },
            data: {
              deleted_at: new Date(),
            },
          });
          deletedCount = invoicesResult.count;
          break;

        case 'quotes':
          // Soft delete old expired/rejected quotes
          const quotesResult = await prisma.quote.updateMany({
            where: {
              tenant_id: policy.tenant_id,
              updated_at: { lt: cutoffDate },
              status: { in: ['EXPIRED', 'REJECTED'] },
              deleted_at: null,
            },
            data: {
              deleted_at: new Date(),
            },
          });
          deletedCount = quotesResult.count;
          break;

        case 'sessions':
          // Hard delete old sessions
          const sessionsResult = await prisma.session.deleteMany({
            where: {
              expires: { lt: cutoffDate },
            },
          });
          deletedCount = sessionsResult.count;
          break;

        case 'dsar_requests':
          // Hard delete completed DSAR requests older than retention period
          const dsarResult = await prisma.dsarRequest.deleteMany({
            where: {
              status: 'COMPLETED',
              completed_at: { lt: cutoffDate },
            },
          });
          deletedCount = dsarResult.count;
          break;

        case 'user_consents':
          // Archive revoked consents older than retention period
          // (keep for audit trail but could be anonymized)
          const consentsCount = await prisma.userConsent.count({
            where: {
              revoked_at: { lt: cutoffDate },
            },
          });
          deletedCount = consentsCount;
          console.log(`   ℹ️  Found ${consentsCount} old revoked consents (kept for audit)`);
          break;

        default:
          console.log(`   ⚠️  Unknown entity type: ${policy.entity_type}`);
          continue;
      }

      // Update last purge timestamp
      await prisma.dataRetentionPolicy.update({
        where: { id: policy.id },
        data: { last_purge_at: new Date() },
      });

      stats.push({
        entityType: policy.entity_type,
        deleted: deletedCount,
        retentionDays: policy.retention_days,
      });

      console.log(`   ✅ Deleted ${deletedCount} records`);
    }

    // Additional cleanup: Delete permanently deleted users' data
    await cleanupDeletedUsers();

    return stats;
  } catch (error) {
    console.error('❌ Error during purge:', error);
    throw error;
  }
}

/**
 * Cleanup data from permanently deleted users
 */
async function cleanupDeletedUsers(): Promise<void> {
  console.log('\n🧹 Cleaning up deleted users data...');

  // Find users deleted more than 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deletedUsers = await prisma.user.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: thirtyDaysAgo,
      },
    },
  });

  console.log(`   Found ${deletedUsers.length} users deleted more than 30 days ago`);

  for (const user of deletedUsers) {
    // Delete user's sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete user's accounts
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // Delete user's consents
    await prisma.userConsent.deleteMany({
      where: { user_id: user.id },
    });

    // Delete DSAR requests
    await prisma.dsarRequest.deleteMany({
      where: { user_id: user.id },
    });

    // Anonymize access logs (keep for audit but remove user link)
    await prisma.accessLog.updateMany({
      where: { user_id: user.id },
      data: { user_id: null },
    });

    // Anonymize activities (keep for audit but anonymize)
    await prisma.activity.updateMany({
      where: { user_id: user.id },
      data: { description: 'Action par utilisateur supprimé' },
    });

    console.log(`   ✅ Cleaned up data for user ${user.id}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    const stats = await purgeOldData();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Purge Summary');
    console.log('='.repeat(60));

    if (stats.length === 0) {
      console.log('No data was purged (no active policies or no old data)');
    } else {
      stats.forEach(stat => {
        console.log(`${stat.entityType.padEnd(20)} | ${stat.deleted} records deleted (retention: ${stat.retentionDays} days)`);
      });
    }

    console.log('='.repeat(60));
    console.log(`✅ Purge completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Purge failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { purgeOldData, cleanupDeletedUsers };

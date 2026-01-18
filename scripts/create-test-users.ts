/**
 * Script to create test users for RBAC manual testing
 *
 * Creates 4 test users (one per role) in separate tenants:
 * - test-user@visioncrm.com (Role: USER)
 * - test-manager@visioncrm.com (Role: MANAGER)
 * - test-accountant@visioncrm.com (Role: ACCOUNTANT)
 * - test-owner@visioncrm.com (Role: OWNER)
 *
 * All users have the same password for testing: Test123!@#
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Test123!@#';

const testUsers = [
  {
    email: 'test-user@visioncrm.com',
    name: 'Test User',
    role: 'USER' as const,
    tenantSubdomain: 'test-user-tenant',
    tenantName: 'Test User Tenant',
  },
  {
    email: 'test-manager@visioncrm.com',
    name: 'Test Manager',
    role: 'MANAGER' as const,
    tenantSubdomain: 'test-manager-tenant',
    tenantName: 'Test Manager Tenant',
  },
  {
    email: 'test-accountant@visioncrm.com',
    name: 'Test Accountant',
    role: 'ACCOUNTANT' as const,
    tenantSubdomain: 'test-accountant-tenant',
    tenantName: 'Test Accountant Tenant',
  },
  {
    email: 'test-owner@visioncrm.com',
    name: 'Test Owner',
    role: 'OWNER' as const,
    tenantSubdomain: 'test-owner-tenant',
    tenantName: 'Test Owner Tenant',
  },
];

async function createTestUsers() {
  console.log('🚀 Creating test users for RBAC testing...\n');

  // Hash password once for all users
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  console.log('✅ Password hashed\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const userData of testUsers) {
    try {
      console.log(`📝 Processing: ${userData.email} (${userData.role})`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`  ⚠️  User already exists - SKIPPED`);
        skipped++;
        continue;
      }

      // Check if tenant exists
      let tenant = await prisma.tenant.findUnique({
        where: { subdomain: userData.tenantSubdomain },
      });

      if (tenant) {
        console.log(`  ℹ️  Using existing tenant: ${userData.tenantSubdomain}`);
      } else {
        // Create tenant
        tenant = await prisma.tenant.create({
          data: {
            subdomain: userData.tenantSubdomain,
            name: userData.tenantName,
            plan: 'PRO', // Give test tenants PRO plan
            company_name: userData.tenantName,
          },
        });
        console.log(`  ✅ Tenant created: ${userData.tenantSubdomain}`);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: passwordHash,
          role: userData.role,
          tenantId: tenant.id,
          emailVerified: new Date(), // Mark as verified for testing
        },
      });

      console.log(`  ✅ User created: ${user.email} (ID: ${user.id})`);
      console.log(`  → Tenant: ${tenant.subdomain}`);
      console.log(`  → Role: ${user.role}\n`);
      created++;
    } catch (error) {
      console.error(`  ❌ Error creating user: ${error}\n`);
      errors++;
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Created:  ${created}`);
  console.log(`⚠️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log('');

  if (created > 0) {
    console.log('🎉 Test users created successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📋 TEST USER CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Password (same for all): Test123!@#');
    console.log('');
    console.log('USER Role:');
    console.log('  Email: test-user@visioncrm.com');
    console.log('  Tenant: test-user-tenant');
    console.log('');
    console.log('MANAGER Role:');
    console.log('  Email: test-manager@visioncrm.com');
    console.log('  Tenant: test-manager-tenant');
    console.log('');
    console.log('ACCOUNTANT Role:');
    console.log('  Email: test-accountant@visioncrm.com');
    console.log('  Tenant: test-accountant-tenant');
    console.log('');
    console.log('OWNER Role:');
    console.log('  Email: test-owner@visioncrm.com');
    console.log('  Tenant: test-owner-tenant');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('🧪 You can now run manual RBAC tests!');
    console.log('   Follow: RBAC_AUTHENTICATED_TEST_GUIDE.md');
    console.log('');
  }

  await prisma.$disconnect();
}

// Run the script
createTestUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

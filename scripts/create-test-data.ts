/**
 * Script to create test data for RBAC manual testing
 *
 * Creates simple sample data in each test tenant:
 * - Projects (for testing project RBAC)
 * - Contacts (for testing basic CRUD)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testTenantSubdomains = [
  'test-user-tenant',
  'test-manager-tenant',
  'test-accountant-tenant',
  'test-owner-tenant',
];

async function createTestData() {
  console.log('🚀 Creating test data for RBAC testing...\n');

  let totalCreated = 0;

  for (const subdomain of testTenantSubdomains) {
    console.log(`📦 Processing tenant: ${subdomain}`);

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: { users: true },
    });

    if (!tenant) {
      console.log(`  ⚠️  Tenant not found - SKIP\n`);
      continue;
    }

    if (tenant.users.length === 0) {
      console.log(`  ⚠️  No users in tenant - SKIP\n`);
      continue;
    }

    const user = tenant.users[0]; // Get first user of tenant
    let created = 0;

    try {
      // Create 2 Projects
      const existingProjects = await prisma.project.count({
        where: { tenant_id: tenant.id },
      });

      if (existingProjects === 0) {
        await prisma.project.createMany({
          data: [
            {
              tenant_id: tenant.id,
              name: 'Website Redesign',
              description: 'Complete website redesign project',
              status: 'IN_PROGRESS',
              start_date: new Date(),
              created_by: user.id,
            },
            {
              tenant_id: tenant.id,
              name: 'Mobile App Development',
              description: 'New mobile application',
              status: 'PLANNING',
              start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              created_by: user.id,
            },
          ],
        });
        console.log('  ✅ Created 2 projects');
        created += 2;
      }

      // Create 3 Contacts
      const existingContacts = await prisma.contact.count({
        where: { tenant_id: tenant.id },
      });

      if (existingContacts === 0) {
        await prisma.contact.createMany({
          data: [
            {
              tenant_id: tenant.id,
              first_name: 'John',
              last_name: 'Smith',
              email: 'john.smith@client.com',
              phone: '+33612345678',
              is_vip: true,
            },
            {
              tenant_id: tenant.id,
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane.doe@supplier.com',
              phone: '+33687654321',
              is_supplier: true,
            },
            {
              tenant_id: tenant.id,
              first_name: 'Bob',
              last_name: 'Wilson',
              email: 'bob.wilson@partner.com',
              phone: '+33698765432',
            },
          ],
        });
        console.log('  ✅ Created 3 contacts');
        created += 3;
      }

      console.log(`  📊 Total created for this tenant: ${created}\n`);
      totalCreated += created;
    } catch (error) {
      console.error(`  ❌ Error creating data:`, error, '\n');
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 FINAL RESULTS');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Total items created: ${totalCreated}`);
  console.log('');
  console.log('🎉 Test data created successfully!');
  console.log('');
  console.log('Each tenant now has:');
  console.log('  - 2 Projects (for testing delete/edit permissions)');
  console.log('  - 3 Contacts (for testing basic CRUD)');
  console.log('');
  console.log('🧪 Ready for manual RBAC testing!');
  console.log('   Follow: RBAC_AUTHENTICATED_TEST_GUIDE.md');
  console.log('');

  await prisma.$disconnect();
}

// Run the script
createTestData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

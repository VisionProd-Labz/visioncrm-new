import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test database for CI/CD...');

  // Clean up existing data
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.task.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Garage CI',
      subdomain: 'test-ci',
      plan: 'PRO',
    },
  });

  console.log('✅ Tenant created');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('TestPassword123!@#', 12);

  // Create OWNER user (for E2E tests)
  const ownerUser = await prisma.user.create({
    data: {
      name: 'Test Owner',
      email: 'owner@test.com',
      password: hashedPassword,
      role: 'OWNER',
      emailVerified: new Date(),
      tenantId: tenant.id,
    },
  });

  console.log('✅ Test user created');

  // Create basic contact for tests
  await prisma.contact.create({
    data: {
      tenant_id: tenant.id,
      first_name: 'Jean',
      last_name: 'Test',
      email: 'jean.test@example.com',
      phone: '+33612345678',
    },
  });

  console.log('✅ Test contact created');

  console.log('\n🎉 Test database seeded successfully!');
  console.log('🔑 Test credentials: owner@test.com / TestPassword123!@#\n');
}

main()
  .catch((e) => {
    console.error('❌ Test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

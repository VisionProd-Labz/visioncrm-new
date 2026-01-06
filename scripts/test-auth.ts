import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔍 Testing authentication...\n');

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: 'demo@visioncrm.app' },
    include: { tenant: true },
  });

  if (!user) {
    console.log('❌ User NOT FOUND in database!');
    console.log('Run: pnpm prisma db seed');
    return;
  }

  console.log('✅ User found:');
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Tenant:', user.tenant?.name);
  console.log('   Role:', user.role);
  console.log('   Has password:', !!user.password);
  console.log('');

  if (!user.password) {
    console.log('❌ User has NO password!');
    return;
  }

  // Test password
  const testPassword = 'demo123456!';
  const isValid = await bcrypt.compare(testPassword, user.password);

  console.log('🔐 Testing password:', testPassword);
  console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');
  console.log('');

  if (!isValid) {
    console.log('❌ Password does not match!');
    console.log('Fixing by updating password...');

    const newHash = await bcrypt.hash(testPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    console.log('✅ Password updated! Try login again.');
  } else {
    console.log('✅ Everything is OK!');
    console.log('\nIf login still fails, check:');
    console.log('1. NextAuth configuration');
    console.log('2. NEXTAUTH_SECRET in .env');
    console.log('3. Browser console for errors');
  }
}

testAuth()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

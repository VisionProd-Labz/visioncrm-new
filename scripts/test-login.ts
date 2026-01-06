import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  console.log('\n🔍 Testing login credentials...\n');

  // Test credentials
  const testEmail = 'demo@visioncrm.app';
  const testPassword = 'demo123456!';

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { tenant: true },
    });

    if (!user) {
      console.log('❌ User not found:', testEmail);
      console.log('\n📋 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true },
      });
      allUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`));
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Tenant:', user.tenant?.name);

    // Test password
    if (!user.password) {
      console.log('❌ User has no password set\n');
      return;
    }

    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    if (isPasswordValid) {
      console.log('✅ Password is valid\n');
      console.log('🎯 Login credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}\n`);
    } else {
      console.log('❌ Password is invalid\n');
      console.log('💡 Try resetting the user password...');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubdomain() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'contact.mauto57@gmail.com' },
      include: { tenant: true },
    });

    if (user && user.tenant) {
      console.log('\n✅ User trouvé!');
      console.log('📧 Email:', user.email);
      console.log('👤 Nom:', user.name);
      console.log('🏢 Tenant:', user.tenant.name);
      console.log('🔑 Subdomain:', user.tenant.subdomain);
      console.log('\n🌐 Votre URL:');
      console.log(`   https://${user.tenant.subdomain}.vision-crm.app`);
      console.log('\n⚠️  Cette URL ne fonctionnera QUE après configuration Vercel + DNS');
    } else {
      console.log('❌ User ou tenant non trouvé');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubdomain();

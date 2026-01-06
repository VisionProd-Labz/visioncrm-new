import { prisma } from '../lib/prisma';

async function checkUser() {
  const email = 'nicouebeglah@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenant: true,
      accounts: true,
    },
  });

  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return;
  }

  console.log('\n✅ Utilisateur trouvé:');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);
  console.log('  Nom:', user.name);
  console.log('  Role:', user.role);

  if (user.tenant) {
    console.log('\n✅ Tenant associé:');
    console.log('  ID:', user.tenant.id);
    console.log('  Nom:', user.tenant.name);
    console.log('  Subdomain:', user.tenant.subdomain);
    console.log('  Plan:', user.tenant.plan);
  } else {
    console.log('\n❌ Pas de tenant associé');
  }

  if (user.accounts.length > 0) {
    console.log('\n✅ Comptes OAuth:');
    user.accounts.forEach(acc => {
      console.log(`  - ${acc.provider} (${acc.providerAccountId})`);
    });
  } else {
    console.log('\n❌ Pas de compte OAuth lié');
  }

  console.log('\n');
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

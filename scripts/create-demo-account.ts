import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoAccount() {
  try {
    console.log('🚀 Création du compte démo...');

    // Vérifier si le tenant démo existe déjà
    let tenant = await prisma.tenant.findUnique({
      where: { subdomain: 'demo' },
    });

    if (!tenant) {
      // Créer le tenant démo
      tenant = await prisma.tenant.create({
        data: {
          subdomain: 'demo',
          name: 'Demo VisionCRM',
          plan: 'PRO',
          company_name: 'Garage Démo',
          company_siret: '12345678901234',
          company_address: {
            street: '123 Rue de la Démo',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
        },
      });
      console.log('✅ Tenant démo créé');
    } else {
      console.log('✅ Tenant démo existe déjà');
    }

    // Vérifier si l'utilisateur démo existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@visioncrm.app' },
    });

    if (existingUser) {
      console.log('✅ Utilisateur démo existe déjà');

      // Mettre à jour le mot de passe au cas où
      const hashedPassword = await bcrypt.hash('demo123456!', 12);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
      console.log('✅ Mot de passe mis à jour');
    } else {
      // Créer l'utilisateur démo
      const hashedPassword = await bcrypt.hash('demo123456!', 12);
      const user = await prisma.user.create({
        data: {
          email: 'demo@visioncrm.app',
          password: hashedPassword,
          name: 'Démo VisionCRM',
          tenantId: tenant.id,
          role: 'OWNER',
          emailVerified: new Date(),
        },
      });
      console.log('✅ Utilisateur démo créé');
    }

    console.log('');
    console.log('🎉 Compte démo prêt !');
    console.log('');
    console.log('📧 Email: demo@visioncrm.app');
    console.log('🔑 Mot de passe: demo123456!');
    console.log('');
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte démo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAccount();

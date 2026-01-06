import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding configuration data...');

  // Get demo tenant
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'demo' },
  });

  if (!tenant) {
    console.error('❌ Demo tenant not found. Please run main seed first.');
    process.exit(1);
  }

  // Create VAT rates if not exist
  const existingVatRates = await prisma.vatRate.count({
    where: { tenant_id: tenant.id },
  });

  if (existingVatRates === 0) {
    await prisma.vatRate.createMany({
      data: [
        {
          tenant_id: tenant.id,
          name: 'TVA Standard 20%',
          rate: 20.00,
          country: 'FR',
          is_default: true,
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: 'TVA Réduite 10%',
          rate: 10.00,
          country: 'FR',
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: 'TVA Réduite 5.5%',
          rate: 5.50,
          country: 'FR',
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: 'TVA Super réduite 2.1%',
          rate: 2.10,
          country: 'FR',
          is_active: true,
        },
      ],
    });
    console.log('✅ Created VAT rates');
  } else {
    console.log('ℹ️  VAT rates already exist');
  }

  // Create payment methods if not exist
  const existingPaymentMethods = await prisma.customPaymentMethod.count({
    where: { tenant_id: tenant.id },
  });

  if (existingPaymentMethods === 0) {
    await prisma.customPaymentMethod.createMany({
      data: [
        {
          tenant_id: tenant.id,
          name: 'Espèces',
          code: 'CASH',
          is_default: false,
          is_active: true,
          sort_order: 1,
        },
        {
          tenant_id: tenant.id,
          name: 'Carte bancaire',
          code: 'CARD',
          is_default: true,
          is_active: true,
          sort_order: 2,
        },
        {
          tenant_id: tenant.id,
          name: 'Virement',
          code: 'BANK_TRANSFER',
          is_default: false,
          is_active: true,
          sort_order: 3,
        },
        {
          tenant_id: tenant.id,
          name: 'Chèque',
          code: 'CHECK',
          is_default: false,
          is_active: true,
          sort_order: 4,
        },
        {
          tenant_id: tenant.id,
          name: 'Paiement en ligne (Stripe)',
          code: 'STRIPE',
          is_default: false,
          is_active: true,
          sort_order: 5,
        },
      ],
    });
    console.log('✅ Created payment methods');
  } else {
    console.log('ℹ️  Payment methods already exist');
  }

  // Create payment terms if not exist
  const existingPaymentTerms = await prisma.paymentTerm.count({
    where: { tenant_id: tenant.id },
  });

  if (existingPaymentTerms === 0) {
    await prisma.paymentTerm.createMany({
      data: [
        {
          tenant_id: tenant.id,
          name: 'Comptant',
          days: 0,
          type: 'NET',
          is_default: true,
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: '30 jours',
          days: 30,
          type: 'NET',
          is_default: false,
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: '45 jours fin de mois',
          days: 45,
          type: 'EOM',
          is_default: false,
          is_active: true,
        },
        {
          tenant_id: tenant.id,
          name: '60 jours',
          days: 60,
          type: 'NET',
          is_default: false,
          is_active: true,
        },
      ],
    });
    console.log('✅ Created payment terms');
  } else {
    console.log('ℹ️  Payment terms already exist');
  }

  // Create task categories if not exist
  const existingTaskCategories = await prisma.taskCategory.count({
    where: { tenant_id: tenant.id },
  });

  if (existingTaskCategories === 0) {
    await prisma.taskCategory.createMany({
      data: [
        {
          tenant_id: tenant.id,
          name: 'Appel téléphonique',
          color: '#3B82F6',
          icon: 'Phone',
          is_default: false,
          is_active: true,
          sort_order: 1,
        },
        {
          tenant_id: tenant.id,
          name: 'Email',
          color: '#10B981',
          icon: 'Mail',
          is_default: false,
          is_active: true,
          sort_order: 2,
        },
        {
          tenant_id: tenant.id,
          name: 'Relance',
          color: '#F59E0B',
          icon: 'Bell',
          is_default: false,
          is_active: true,
          sort_order: 3,
        },
        {
          tenant_id: tenant.id,
          name: 'Suivi',
          color: '#8B5CF6',
          icon: 'Eye',
          is_default: true,
          is_active: true,
          sort_order: 4,
        },
        {
          tenant_id: tenant.id,
          name: 'Rendez-vous',
          color: '#EC4899',
          icon: 'Calendar',
          is_default: false,
          is_active: true,
          sort_order: 5,
        },
      ],
    });
    console.log('✅ Created task categories');
  } else {
    console.log('ℹ️  Task categories already exist');
  }

  // Update tenant with regional settings if not set
  if (!tenant.date_format) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        date_format: 'DD-MM-YYYY',
        number_format: {
          decimal_separator: ',',
          thousand_separator: ' ',
          decimals: 2,
        },
        currency_display: 'after',
        phone_clickable: true,
      },
    });
    console.log('✅ Updated regional settings');
  } else {
    console.log('ℹ️  Regional settings already configured');
  }

  console.log('🎉 Configuration seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      subdomain: 'demo',
      name: 'Garage Demo',
      plan: 'PRO',
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@visioncrm.app' },
    update: {},
    create: {
      email: 'demo@visioncrm.app',
      password: hashedPassword,
      name: 'Marc Dupont',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create demo contacts
  const contact1 = await prisma.contact.create({
    data: {
      tenant_id: tenant.id,
      first_name: 'Sophie',
      last_name: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '+33612345678',
      company: 'Martin Transport',
      tags: ['VIP', 'Fidèle'],
      is_vip: true,
      address: {
        street: '15 Rue de la République',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
      },
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      tenant_id: tenant.id,
      first_name: 'Jean',
      last_name: 'Dubois',
      email: 'jean.dubois@example.com',
      phone: '+33687654321',
      tags: ['Nouveau'],
      address: {
        street: '28 Avenue des Champs',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
      },
    },
  });

  console.log('✅ Created contacts');

  // Create demo vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      tenant_id: tenant.id,
      owner_id: contact1.id,
      vin: 'WBADT43452GZ30622',
      license_plate: 'AB-123-CD',
      make: 'Renault',
      model: 'Clio',
      year: 2019,
      color: 'Bleu',
      mileage: 45000,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      tenant_id: tenant.id,
      owner_id: contact2.id,
      vin: 'VF1RFB0F537667890',
      license_plate: 'EF-456-GH',
      make: 'Peugeot',
      model: '308',
      year: 2021,
      color: 'Noir',
      mileage: 25000,
    },
  });

  console.log('✅ Created vehicles');

  // Create service records
  await prisma.serviceRecord.createMany({
    data: [
      {
        vehicle_id: vehicle1.id,
        date: new Date('2024-01-15'),
        mileage: 40000,
        description: 'Vidange + changement filtre',
        cost: 120.50,
      },
      {
        vehicle_id: vehicle1.id,
        date: new Date('2024-06-20'),
        mileage: 45000,
        description: 'Révision complète',
        cost: 350.00,
      },
    ],
  });

  console.log('✅ Created service records');

  // Create demo quote
  const quote = await prisma.quote.create({
    data: {
      tenant_id: tenant.id,
      contact_id: contact1.id,
      quote_number: 'DEV-2026-001',
      issue_date: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          description: 'Vidange complète',
          quantity: 1,
          unit_price: 80,
          vat_rate: 20,
        },
        {
          description: 'Changement plaquettes de frein',
          quantity: 1,
          unit_price: 150,
          vat_rate: 20,
        },
      ],
      subtotal: 230,
      vat_amount: 46,
      total: 276,
      status: 'SENT',
    },
  });

  console.log('✅ Created quote');

  // Create demo invoice
  await prisma.invoice.create({
    data: {
      tenant_id: tenant.id,
      contact_id: contact2.id,
      invoice_number: 'FACT-2026-001',
      issue_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          description: 'Révision 30 000 km',
          quantity: 1,
          unit_price: 200,
          vat_rate: 20,
        },
      ],
      subtotal: 200,
      vat_amount: 40,
      total: 240,
      status: 'SENT',
      siret: '12345678901234',
      tva_number: 'FR12345678901',
    },
  });

  console.log('✅ Created invoice');

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        tenant_id: tenant.id,
        title: 'Rappeler Sophie Martin pour devis',
        description: 'Discuter du devis DEV-2026-001',
        contact_id: contact1.id,
        assignee_id: user.id,
        status: 'TODO',
        priority: 'HIGH',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        tenant_id: tenant.id,
        title: 'Préparer véhicule Jean Dubois',
        description: 'Révision programmée pour vendredi',
        contact_id: contact2.id,
        assignee_id: user.id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created tasks');

  // Create demo activities
  await prisma.activity.createMany({
    data: [
      {
        tenant_id: tenant.id,
        user_id: user.id,
        contact_id: contact1.id,
        type: 'EMAIL_SENT',
        description: 'Envoi du devis DEV-2026-001',
        metadata: {
          subject: 'Votre devis VisionCRM',
          quote_id: quote.id,
        },
      },
      {
        tenant_id: tenant.id,
        user_id: user.id,
        contact_id: contact1.id,
        type: 'CALL_MADE',
        description: 'Appel de suivi - client satisfait',
        metadata: {
          duration: 180,
        },
      },
    ],
  });

  console.log('✅ Created activities');

  // Create catalog items
  await prisma.catalogItem.createMany({
    data: [
      {
        tenant_id: tenant.id,
        name: 'Filtre à huile',
        reference: 'FO-001',
        description: 'Filtre à huile universel haute qualité',
        category: 'Filtres',
        price: 12.50,
        cost: 7.00,
        stock: 45,
        min_stock: 10,
      },
      {
        tenant_id: tenant.id,
        name: 'Plaquettes de frein avant',
        reference: 'PF-002',
        description: 'Jeu de plaquettes de frein avant',
        category: 'Freinage',
        price: 45.00,
        cost: 25.00,
        stock: 23,
        min_stock: 5,
      },
      {
        tenant_id: tenant.id,
        name: 'Courroie de distribution',
        reference: 'CD-003',
        description: 'Kit courroie de distribution complet',
        category: 'Distribution',
        price: 85.00,
        cost: 50.00,
        stock: 12,
        min_stock: 3,
      },
      {
        tenant_id: tenant.id,
        name: 'Batterie 12V 70Ah',
        reference: 'BAT-004',
        description: 'Batterie démarrage 12V 70Ah',
        category: 'Électrique',
        price: 120.00,
        cost: 75.00,
        stock: 8,
        min_stock: 2,
      },
      {
        tenant_id: tenant.id,
        name: 'Amortisseur avant',
        reference: 'AM-005',
        description: 'Amortisseur avant hydraulique',
        category: 'Suspension',
        price: 95.00,
        cost: 55.00,
        stock: 15,
        min_stock: 4,
      },
      {
        tenant_id: tenant.id,
        name: 'Filtre à air',
        reference: 'FA-006',
        description: 'Filtre à air moteur',
        category: 'Filtres',
        price: 18.00,
        cost: 10.00,
        stock: 32,
        min_stock: 8,
      },
      {
        tenant_id: tenant.id,
        name: 'Disque de frein avant',
        reference: 'DF-007',
        description: 'Paire de disques de frein avant ventilés',
        category: 'Freinage',
        price: 65.00,
        cost: 38.00,
        stock: 18,
        min_stock: 4,
      },
      {
        tenant_id: tenant.id,
        name: 'Huile moteur 5W30',
        reference: 'HM-008',
        description: 'Bidon 5L huile synthétique 5W30',
        category: 'Lubrifiants',
        price: 35.00,
        cost: 20.00,
        stock: 50,
        min_stock: 15,
      },
    ],
  });

  console.log('✅ Created catalog items');

  // Create planning events
  const now = new Date();
  await prisma.event.createMany({
    data: [
      {
        tenant_id: tenant.id,
        title: 'Révision Peugeot 308',
        description: 'Révision annuelle complète',
        start_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
        all_day: false,
        type: 'MAINTENANCE',
        contact_id: contact2.id,
        vehicle_id: vehicle2.id,
      },
      {
        tenant_id: tenant.id,
        title: 'Rendez-vous client',
        description: 'Discussion devis carrosserie',
        start_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
        all_day: false,
        type: 'MEETING',
        contact_id: contact1.id,
      },
      {
        tenant_id: tenant.id,
        title: 'Réparation transmission',
        description: 'Remplacement embrayage',
        start_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        all_day: false,
        type: 'REPAIR',
        contact_id: contact1.id,
        vehicle_id: vehicle1.id,
      },
      {
        tenant_id: tenant.id,
        title: 'Livraison véhicule',
        description: 'Remise véhicule après réparation',
        start_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
        all_day: false,
        type: 'OTHER',
        contact_id: contact2.id,
      },
    ],
  });

  console.log('✅ Created events');

  // Create conversations
  const conv1 = await prisma.conversation.create({
    data: {
      tenant_id: tenant.id,
      contact_name: 'Sophie Martin',
      contact_phone: '+33612345678',
      platform: 'WHATSAPP',
      unread_count: 2,
      last_message: 'Merci pour le devis, je reviens vers vous bientôt',
      last_message_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      tenant_id: tenant.id,
      contact_name: 'Jean Dubois',
      contact_phone: '+33687654321',
      platform: 'TELEGRAM',
      unread_count: 0,
      last_message: 'Pouvez-vous me rappeler demain ?',
      last_message_at: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
  });

  const conv3 = await prisma.conversation.create({
    data: {
      tenant_id: tenant.id,
      contact_name: 'Pierre Bernard',
      contact_phone: '+33611223344',
      platform: 'WHATSAPP',
      unread_count: 0,
      last_message: 'La facture est bien reçue',
      last_message_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created conversations');

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        conversation_id: conv1.id,
        content: 'Bonjour, voici le devis pour votre véhicule',
        sender: 'ME',
        status: 'READ',
        created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        conversation_id: conv1.id,
        content: 'Merci beaucoup !',
        sender: 'THEM',
        status: 'DELIVERED',
        created_at: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
      },
      {
        conversation_id: conv1.id,
        content: 'Merci pour le devis, je reviens vers vous bientôt',
        sender: 'THEM',
        status: 'DELIVERED',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        conversation_id: conv2.id,
        content: 'Bonjour Jean, comment puis-je vous aider ?',
        sender: 'ME',
        status: 'READ',
        created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        conversation_id: conv2.id,
        content: 'Pouvez-vous me rappeler demain ?',
        sender: 'THEM',
        status: 'DELIVERED',
        created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created messages');

  // Create email accounts
  const emailAcc1 = await prisma.emailAccount.create({
    data: {
      tenant_id: tenant.id,
      provider: 'GMAIL',
      email: 'contact@garage.com',
      name: 'Garage Principal',
      connected: true,
    },
  });

  const emailAcc2 = await prisma.emailAccount.create({
    data: {
      tenant_id: tenant.id,
      provider: 'OUTLOOK',
      email: 'commercial@garage.fr',
      name: 'Commercial',
      connected: true,
    },
  });

  console.log('✅ Created email accounts');

  // Create emails
  await prisma.email.createMany({
    data: [
      {
        account_id: emailAcc1.id,
        from_account_id: null,
        from_email: 'sophie.martin@example.com',
        from_name: 'Sophie Martin',
        to_emails: ['contact@garage.com'],
        subject: 'Demande de devis pour révision',
        body: 'Bonjour,\n\nJe souhaiterais obtenir un devis pour la révision de mon véhicule Renault Clio de 2019.\n\nCordialement,\nSophie Martin',
        read: false,
        starred: false,
        folder: 'INBOX',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        account_id: emailAcc1.id,
        from_account_id: null,
        from_email: 'jean.dubois@example.com',
        from_name: 'Jean Dubois',
        to_emails: ['contact@garage.com'],
        subject: 'Re: Facture #FACT-2026-001',
        body: 'Bonjour,\n\nJe confirme la réception de la facture. Le paiement sera effectué cette semaine.\n\nMerci,\nJean Dubois',
        read: true,
        starred: true,
        folder: 'INBOX',
        attachments: [{ name: 'facture_001.pdf', size: '245 KB' }],
        created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        account_id: emailAcc1.id,
        from_account_id: emailAcc1.id,
        from_email: 'contact@garage.com',
        from_name: 'Garage Demo',
        to_emails: ['pierre.bernard@example.com'],
        subject: 'Devis #DEV-2026-001',
        body: 'Bonjour Monsieur Bernard,\n\nVeuillez trouver ci-joint le devis pour la réparation de votre véhicule.\n\nCordialement,\nL\'équipe du garage',
        read: true,
        starred: false,
        folder: 'SENT',
        attachments: [{ name: 'devis_042.pdf', size: '312 KB' }],
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created emails');

  // Create documents
  await prisma.document.createMany({
    data: [
      {
        tenant_id: tenant.id,
        name: 'KBIS.pdf',
        category: 'Légal',
        file_url: '/uploads/demo/kbis.pdf',
        file_type: 'pdf',
        file_size: 251904, // 245 KB
        created_at: new Date('2024-01-15'),
      },
      {
        tenant_id: tenant.id,
        name: 'Assurance_RC.pdf',
        category: 'Assurance',
        file_url: '/uploads/demo/assurance_rc.pdf',
        file_type: 'pdf',
        file_size: 1258291, // 1.2 MB
        created_at: new Date('2024-01-10'),
      },
      {
        tenant_id: tenant.id,
        name: 'Contrat_bail.pdf',
        category: 'Immobilier',
        file_url: '/uploads/demo/contrat_bail.pdf',
        file_type: 'pdf',
        file_size: 911360, // 890 KB
        created_at: new Date('2023-12-01'),
      },
    ],
  });

  console.log('✅ Created documents');

  // Update tenant with company info
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      company_name: 'Garage Demo SARL',
      company_siret: '12345678901234',
      company_tva: 'FR12345678901',
      company_address: {
        street: '12 Avenue de la République',
        city: 'Paris',
        postalCode: '75011',
        country: 'France',
      },
      company_info: {
        legalForm: 'SARL',
        capital: 10000,
        creationDate: '2015-03-15',
        website: 'https://www.garage-demo.fr',
        phone: '+33 1 23 45 67 89',
        email: 'contact@garage-demo.fr',
      },
    },
  });

  console.log('✅ Updated company info');

  // Create VAT rates (French tax rates)
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

  // Create payment methods
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

  // Create payment terms
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

  // Create task categories
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

  console.log('🎉 Seeding complete!');
  console.log('\n📧 Demo credentials:');
  console.log('   Email: demo@visioncrm.app');
  console.log('   Password: demo123456!');
  console.log('   Subdomain: demo');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

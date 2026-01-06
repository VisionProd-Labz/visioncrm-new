import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('Twilio credentials are not defined');
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(params: {
  to: string;
  message: string;
}) {
  // Ensure phone number has whatsapp: prefix
  const toNumber = params.to.startsWith('whatsapp:')
    ? params.to
    : `whatsapp:${params.to}`;

  const message = await client.messages.create({
    from: `whatsapp:${WHATSAPP_NUMBER}`,
    to: toNumber,
    body: params.message,
  });

  return message;
}

/**
 * Send quote via WhatsApp
 */
export async function sendQuoteWhatsApp(params: {
  to: string;
  contactName: string;
  quoteNumber: string;
  quoteId: string;
  total: number;
}) {
  const message = `Bonjour ${params.contactName},

Votre devis n°${params.quoteNumber} est prêt !

Montant total : ${params.total}€

Consultez-le ici : ${process.env.NEXTAUTH_URL}/quotes/${params.quoteId}

Cordialement,
L'équipe VisionCRM`;

  return sendWhatsAppMessage({
    to: params.to,
    message,
  });
}

/**
 * Send invoice via WhatsApp
 */
export async function sendInvoiceWhatsApp(params: {
  to: string;
  contactName: string;
  invoiceNumber: string;
  invoiceId: string;
  total: number;
  dueDate: string;
}) {
  const message = `Bonjour ${params.contactName},

Votre facture n°${params.invoiceNumber} est disponible.

Montant : ${params.total}€
Échéance : ${params.dueDate}

Consultez-la ici : ${process.env.NEXTAUTH_URL}/invoices/${params.invoiceId}

Merci !
L'équipe VisionCRM`;

  return sendWhatsAppMessage({
    to: params.to,
    message,
  });
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(params: {
  to: string;
  contactName: string;
  date: string;
  service: string;
}) {
  const message = `Bonjour ${params.contactName},

Rappel de rendez-vous :
📅 ${params.date}
🔧 ${params.service}

À bientôt !`;

  return sendWhatsAppMessage({
    to: params.to,
    message,
  });
}

export default client;

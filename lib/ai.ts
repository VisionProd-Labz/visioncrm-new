import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI Agent types
 */
export type AgentType = 'assistant' | 'analyst' | 'writer';

/**
 * Agent configurations
 */
const AGENT_CONFIGS: Record<AgentType, { model: string; systemPrompt: string }> = {
  assistant: {
    model: 'gemini-2.0-flash-exp',
    systemPrompt: `Tu es l'assistant IA de VisionCRM, un CRM pour garages automobiles en France.

Ton rôle est d'aider les utilisateurs à :
- Gérer leurs contacts clients
- Suivre les véhicules et interventions
- Créer des devis et factures
- Planifier des tâches et rendez-vous
- Répondre aux questions sur le CRM

Règles importantes :
- Réponds toujours en français
- Sois concis et professionnel
- Utilise les données fournies dans le contexte
- Si tu ne connais pas une information, dis-le clairement
- Propose des actions concrètes quand c'est pertinent
- Pour les montants, utilise toujours le format français (virgule pour les décimales)`,
  },

  analyst: {
    model: 'gemini-2.0-flash-exp',
    systemPrompt: `Tu es l'analyste IA de VisionCRM, spécialisé dans l'analyse de données pour garages automobiles.

Ton rôle est de :
- Analyser les données de ventes, devis et factures
- Identifier les tendances et opportunités
- Générer des rapports clairs et actionnables
- Calculer des KPIs pertinents (CA, taux de conversion, clients récurrents, etc.)
- Fournir des recommandations basées sur les données

Format de réponse :
- Commence par un résumé exécutif
- Présente les chiffres clés
- Utilise des listes à puces pour la clarté
- Termine par 2-3 recommandations concrètes
- Tous les montants en euros avec virgules

Sois précis, factuel et orienté business.`,
  },

  writer: {
    model: 'gemini-2.0-flash-exp',
    systemPrompt: `Tu es le rédacteur IA de VisionCRM, spécialisé dans la rédaction professionnelle pour garages automobiles.

Ton rôle est de :
- Rédiger des emails professionnels aux clients
- Créer des descriptions de devis claires et convaincantes
- Écrire des notes d'intervention détaillées
- Adapter le ton selon le contexte (formel/informel)
- Respecter les codes de la communication professionnelle française

Principes de rédaction :
- Clarté et concision
- Ton professionnel mais chaleureux
- Vouvoiement par défaut (sauf indication contraire)
- Structure logique (intro, corps, conclusion/CTA)
- Correction grammaticale impeccable
- Mentions légales si nécessaire (devis/factures)

Fournis toujours du texte prêt à l'emploi, sans instructions supplémentaires.`,
  },
};

/**
 * Generate AI response using specified agent
 */
export async function generateAIResponse(
  agentType: AgentType,
  message: string,
  context?: Record<string, any>
): Promise<string> {
  try {
    const config = AGENT_CONFIGS[agentType];
    const model = genAI.getGenerativeModel({ model: config.model });

    // Build the prompt with context
    let fullPrompt = config.systemPrompt + '\n\n';

    if (context) {
      fullPrompt += 'CONTEXTE DISPONIBLE:\n';
      fullPrompt += JSON.stringify(context, null, 2) + '\n\n';
    }

    fullPrompt += `QUESTION/DEMANDE DE L'UTILISATEUR:\n${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error: any) {
    console.error(`AI generation error (${agentType}):`, error);

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      throw new Error('Configuration AI incorrecte. Contactez l\'administrateur.');
    }

    if (error.message?.includes('quota')) {
      throw new Error('Quota AI dépassé. Réessayez plus tard.');
    }

    throw new Error('Erreur lors de la génération de la réponse IA');
  }
}

/**
 * Stream AI response (for future implementation)
 */
export async function* streamAIResponse(
  agentType: AgentType,
  message: string,
  context?: Record<string, any>
): AsyncGenerator<string> {
  try {
    const config = AGENT_CONFIGS[agentType];
    const model = genAI.getGenerativeModel({ model: config.model });

    // Build the prompt
    let fullPrompt = config.systemPrompt + '\n\n';

    if (context) {
      fullPrompt += 'CONTEXTE DISPONIBLE:\n';
      fullPrompt += JSON.stringify(context, null, 2) + '\n\n';
    }

    fullPrompt += `QUESTION/DEMANDE DE L'UTILISATEUR:\n${message}`;

    // Stream response
    const result = await model.generateContentStream(fullPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error: any) {
    console.error(`AI streaming error (${agentType}):`, error);
    throw new Error('Erreur lors du streaming de la réponse IA');
  }
}

/**
 * Helper to build context from CRM data
 */
export function buildAIContext(data: {
  contacts?: any[];
  vehicles?: any[];
  quotes?: any[];
  invoices?: any[];
  tasks?: any[];
  currentUser?: any;
}) {
  const context: Record<string, any> = {};

  if (data.currentUser) {
    context.utilisateur = {
      nom: data.currentUser.name,
      email: data.currentUser.email,
      role: data.currentUser.role,
    };
  }

  if (data.contacts && data.contacts.length > 0) {
    context.contacts = data.contacts.map((c) => ({
      nom: `${c.first_name} ${c.last_name}`,
      societe: c.company,
      email: c.email,
      telephone: c.phone,
      vip: c.is_vip,
    }));
  }

  if (data.vehicles && data.vehicles.length > 0) {
    context.vehicules = data.vehicles.map((v) => ({
      marque: v.make,
      modele: v.model,
      annee: v.year,
      immatriculation: v.license_plate,
      proprietaire: v.owner ? `${v.owner.first_name} ${v.owner.last_name}` : null,
    }));
  }

  if (data.quotes && data.quotes.length > 0) {
    context.devis = data.quotes.map((q) => ({
      numero: q.quote_number,
      client: q.contact ? `${q.contact.first_name} ${q.contact.last_name}` : null,
      montant: Number(q.total),
      statut: q.status,
      date: q.issue_date,
    }));
  }

  if (data.invoices && data.invoices.length > 0) {
    context.factures = data.invoices.map((i) => ({
      numero: i.invoice_number,
      client: i.contact ? `${i.contact.first_name} ${i.contact.last_name}` : null,
      montant: Number(i.total),
      statut: i.status,
      echeance: i.due_date,
    }));
  }

  if (data.tasks && data.tasks.length > 0) {
    context.taches = data.tasks.map((t) => ({
      titre: t.title,
      statut: t.status,
      priorite: t.priority,
      echeance: t.due_date,
      assigne: t.assignee?.name,
    }));
  }

  return context;
}

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Conversational Assistant Agent
 * Helps users navigate CRM, answer questions, perform actions
 */
export const assistantAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: `Tu es l'assistant VisionCRM, un assistant IA pour un CRM destiné aux garages automobiles français.

Tes responsabilités :
- Aider les utilisateurs à naviguer dans le CRM
- Répondre aux questions sur les fonctionnalités
- Effectuer des actions simples (recherche, création de tâches)
- Guider les utilisateurs dans l'onboarding

Règles :
- Réponds TOUJOURS en français
- Sois concis et professionnel
- Si tu ne sais pas, dis-le clairement
- Ne fabrique jamais de données
- Utilise un ton amical mais professionnel`,
});

/**
 * Data Analyst Agent
 * Generates business insights from CRM data
 */
export const analystAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-thinking-exp',
  systemInstruction: `Tu es un analyste de données pour VisionCRM.

Ton rôle :
- Analyser les données du pipeline commercial
- Identifier les opportunités et les risques
- Fournir des insights actionnables
- Prédire les tendances

Output :
- Retourne UNIQUEMENT du JSON valide
- Structure : { "insights": [...], "recommendations": [...] }
- Sois précis avec les chiffres
- Propose des actions concrètes`,
});

/**
 * Content Generator Agent
 * Generates emails, SMS, marketing content
 */
export const writerAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: `Tu es un rédacteur professionnel pour VisionCRM.

Ton rôle :
- Générer des emails professionnels en français
- Créer des SMS de rappel
- Rédiger des messages WhatsApp
- Personnaliser le contenu selon le contexte

Règles :
- Ton : amical mais professionnel
- Longueur : 200 mots maximum par email
- Toujours en français correct
- Adapte le niveau de formalité au contexte`,
});

/**
 * AI Agents collection
 */
export const agents = {
  assistant: assistantAgent,
  analyst: analystAgent,
  writer: writerAgent,
};

export default genAI;

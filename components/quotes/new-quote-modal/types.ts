/**
 * New Quote Modal - TypeScript Interfaces
 * Shared types for multi-step quote creation wizard
 */

export interface ClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
}

export interface QuoteRequestData {
  prompt: string;
  urgency: 'normal' | 'urgent' | 'very_urgent';
  estimatedBudget?: string;
}

export interface NewQuoteWizardData {
  client: ClientData;
  quoteRequest: QuoteRequestData;
}

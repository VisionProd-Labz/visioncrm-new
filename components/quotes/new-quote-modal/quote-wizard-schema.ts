/**
 * Quote Wizard Validation Schemas
 * Using Zod for type-safe multi-step form validation
 */

import { z } from 'zod';

// Step 1: Client Information Schema
export const clientSchema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long (max 50 caractères)'),

  lastName: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long (max 50 caractères)'),

  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis'),

  phone: z.string()
    .optional()
    .or(z.literal('')),

  company: z.string()
    .optional()
    .or(z.literal('')),

  address: z.string()
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Step 2: Quote Request Schema
export const quoteRequestSchema = z.object({
  prompt: z.string()
    .min(20, 'Description trop courte (min 20 caractères)')
    .max(2000, 'Description trop longue (max 2000 caractères)'),

  urgency: z.enum(['normal', 'urgent', 'very_urgent'], {
    errorMap: () => ({ message: 'Urgence invalide' }),
  }),

  estimatedBudget: z.string()
    .optional()
    .or(z.literal('')),
});

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// Combined wizard data (for type safety)
export const quoteWizardSchema = z.object({
  client: clientSchema,
  quoteRequest: quoteRequestSchema,
});

export type QuoteWizardData = z.infer<typeof quoteWizardSchema>;

// Default values
export const defaultClientValues: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address: '',
};

export const defaultQuoteRequestValues: QuoteRequestFormData = {
  prompt: '',
  urgency: 'normal',
  estimatedBudget: '',
};

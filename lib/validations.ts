import { z } from 'zod';
import { sanitizeText, sanitizeEmail, sanitizeRichText, sanitizePhone } from './sanitize';

/**
 * ✅ SECURITY FIX #6: HTML Sanitization integrated in Zod validations
 * All user inputs are sanitized before validation to prevent XSS attacks
 */

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
  email: z.string().transform(sanitizeEmail).pipe(z.string().email('Email invalide')),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const registerSchema = z.object({
  name: z.string().transform(sanitizeText).pipe(z.string().min(2, 'Le nom doit contenir au moins 2 caractères')),
  email: z.string().transform(sanitizeEmail).pipe(z.string().email('Email invalide')),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
  tenantName: z.string().transform(sanitizeText).pipe(z.string().min(2, 'Le nom de l\'entreprise est requis')),
  subdomain: z.string()
    .transform(sanitizeText)
    .pipe(z.string()
      .min(3, 'Le sous-domaine doit contenir au moins 3 caractères')
      .max(63, 'Le sous-domaine ne peut pas dépasser 63 caractères')
      .regex(/^[a-z0-9-]+$/, 'Le sous-domaine ne peut contenir que des lettres minuscules, chiffres et tirets')),
});

/**
 * Contact Schemas
 */
export const contactSchema = z.object({
  first_name: z.string().transform(sanitizeText).pipe(z.string().min(1, 'Le prénom est requis')),
  last_name: z.string().transform(sanitizeText).pipe(z.string().min(1, 'Le nom est requis')),
  email: z.string().transform(sanitizeEmail).pipe(z.string().email('Email invalide')).optional().or(z.literal('')),
  phone: z.string().transform(sanitizePhone).optional(),
  company: z.string().transform(sanitizeText).optional(),
  address: z.object({
    street: z.string().transform(sanitizeText).optional(),
    city: z.string().transform(sanitizeText).optional(),
    postalCode: z.string().transform(sanitizeText).optional(),
    country: z.string().transform(sanitizeText).default('France'),
  }).optional(),
  tags: z.array(z.string().transform(sanitizeText)).default([]),
  is_vip: z.boolean().default(false),
  custom_fields: z.record(z.any()).optional(),
});

/**
 * Vehicle Schemas
 */
export const vehicleSchema = z.object({
  owner_id: z.string().transform(sanitizeText).pipe(z.string().uuid('ID de contact invalide')),
  vin: z.string().transform(sanitizeText).pipe(z.string().length(17, 'Le VIN doit contenir exactement 17 caractères')),
  license_plate: z.string().transform(sanitizeText).pipe(z.string().min(1, 'La plaque d\'immatriculation est requise')),
  make: z.string().transform(sanitizeText).pipe(z.string().min(1, 'La marque est requise')),
  model: z.string().transform(sanitizeText).pipe(z.string().min(1, 'Le modèle est requis')),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().transform(sanitizeText).optional(),
  mileage: z.number().int().min(0).optional(),
  insurance_expiry: z.string().transform(sanitizeText).optional(),
  warranty_expiry: z.string().transform(sanitizeText).optional(),
});

/**
 * Quote Schemas
 */
export const quoteItemSchema = z.object({
  description: z.string().transform(sanitizeRichText).pipe(z.string().min(1, 'La description est requise')),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  unit_price: z.number().min(0, 'Le prix unitaire doit être positif'),
  vat_rate: z.number().min(0).max(100).default(20),
});

export const quoteSchema = z.object({
  contact_id: z.string().transform(sanitizeText).pipe(z.string().uuid('ID de contact invalide')),
  valid_until: z.string().or(z.date()),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article est requis'),
  notes: z.string().transform(sanitizeRichText).optional(),
});

/**
 * Invoice Schemas
 */
export const invoiceSchema = z.object({
  contact_id: z.string().transform(sanitizeText).pipe(z.string().uuid('ID de contact invalide')),
  quote_id: z.string().transform(sanitizeText).pipe(z.string().uuid()).optional(),
  due_date: z.string().or(z.date()),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article est requis'),
  siret: z.string().transform(sanitizeText).pipe(z.string().length(14, 'Le SIRET doit contenir 14 chiffres')).optional(),
  tva_number: z.string().transform(sanitizeText).optional(),
  notes: z.string().transform(sanitizeRichText).optional(),
});

/**
 * Task Schemas
 */
export const taskSchema = z.object({
  title: z.string().transform(sanitizeText).pipe(z.string().min(1, 'Le titre est requis')),
  description: z.string().transform(sanitizeRichText).optional(),
  assignee_id: z.string().transform(sanitizeText).pipe(z.string().uuid()).optional(),
  contact_id: z.string().transform(sanitizeText).pipe(z.string().uuid()).optional(),
  due_date: z.string().or(z.date()).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

/**
 * Activity Schemas
 */
export const activitySchema = z.object({
  contact_id: z.string().transform(sanitizeText).pipe(z.string().uuid()).optional(),
  type: z.enum([
    'EMAIL_SENT',
    'EMAIL_RECEIVED',
    'WHATSAPP_SENT',
    'WHATSAPP_RECEIVED',
    'SMS_SENT',
    'CALL_MADE',
    'CALL_RECEIVED',
    'NOTE_ADDED',
    'MEETING',
    'SITE_VISIT',
    'QUOTE_SENT',
    'INVOICE_SENT',
    'PAYMENT_RECEIVED',
  ]),
  description: z.string().transform(sanitizeRichText).pipe(z.string().min(1, 'La description est requise')),
  metadata: z.record(z.any()).optional(),
});

/**
 * AI Chat Schemas
 */
export const aiChatSchema = z.object({
  message: z.string().transform(sanitizeText).pipe(z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long')),
  context: z.record(z.any()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;

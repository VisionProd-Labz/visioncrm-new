import { z } from 'zod';

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
  tenantName: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  subdomain: z.string()
    .min(3, 'Le sous-domaine doit contenir au moins 3 caractères')
    .max(63, 'Le sous-domaine ne peut pas dépasser 63 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le sous-domaine ne peut contenir que des lettres minuscules, chiffres et tirets'),
});

/**
 * Contact Schemas
 */
export const contactSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('France'),
  }).optional(),
  tags: z.array(z.string()).default([]),
  is_vip: z.boolean().default(false),
  custom_fields: z.record(z.any()).optional(),
});

/**
 * Vehicle Schemas
 */
export const vehicleSchema = z.object({
  owner_id: z.string().uuid('ID de contact invalide'),
  vin: z.string().length(17, 'Le VIN doit contenir exactement 17 caractères'),
  license_plate: z.string().min(1, 'La plaque d\'immatriculation est requise'),
  make: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  insurance_expiry: z.string().optional(),
  warranty_expiry: z.string().optional(),
});

/**
 * Quote Schemas
 */
export const quoteItemSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  unit_price: z.number().min(0, 'Le prix unitaire doit être positif'),
  vat_rate: z.number().min(0).max(100).default(20),
});

export const quoteSchema = z.object({
  contact_id: z.string().uuid('ID de contact invalide'),
  valid_until: z.string().or(z.date()),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article est requis'),
  notes: z.string().optional(),
});

/**
 * Invoice Schemas
 */
export const invoiceSchema = z.object({
  contact_id: z.string().uuid('ID de contact invalide'),
  quote_id: z.string().uuid().optional(),
  due_date: z.string().or(z.date()),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article est requis'),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').optional(),
  tva_number: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Task Schemas
 */
export const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  due_date: z.string().or(z.date()).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

/**
 * Activity Schemas
 */
export const activitySchema = z.object({
  contact_id: z.string().uuid().optional(),
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
  description: z.string().min(1, 'La description est requise'),
  metadata: z.record(z.any()).optional(),
});

/**
 * AI Chat Schemas
 */
export const aiChatSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long'),
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

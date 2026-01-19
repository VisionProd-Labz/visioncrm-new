/**
 * Contact Form Validation Schema
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

export const contactSchema = z.object({
  first_name: z.string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),

  last_name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .optional()
    .or(z.literal('')),

  company: z.string()
    .optional()
    .or(z.literal('')),

  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
  }),

  is_vip: z.boolean(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const defaultContactValues: ContactFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
  },
  is_vip: false,
};

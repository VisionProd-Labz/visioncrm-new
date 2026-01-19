/**
 * Authentication Schemas - Client-side validation
 * Using Zod for type-safe form validation
 */

import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long (max 50 caractères)'),

  lastName: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long (max 50 caractères)'),

  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis'),

  password: z.string()
    .min(12, 'Mot de passe trop court (min 12 caractères)')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[a-z]/, 'Au moins une minuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial requis (@, #, !, etc.)'),

  companyName: z.string()
    .min(2, 'Nom du garage requis (min 2 caractères)')
    .max(100, 'Nom du garage trop long (max 100 caractères)'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

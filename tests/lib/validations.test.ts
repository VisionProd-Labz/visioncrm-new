import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  quoteSchema,
  invoiceSchema,
} from '@/lib/validations';

describe('Validation schemas', () => {
  describe('registerSchema', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      tenantName: 'Test Company',
      subdomain: 'testcompany',
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const { name, ...withoutName } = validData;
      const result = registerSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });

    it('should require valid email', () => {
      const result1 = registerSchema.safeParse({
        ...validData,
        email: 'invalid-email',
      });
      expect(result1.success).toBe(false);

      const result2 = registerSchema.safeParse({
        ...validData,
        email: 'test@',
      });
      expect(result2.success).toBe(false);

      const result3 = registerSchema.safeParse({
        ...validData,
        email: '@example.com',
      });
      expect(result3.success).toBe(false);
    });

    it('should require password with minimum length', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: '12345', // Too short
      });
      expect(result.success).toBe(false);
    });

    it('should require tenantName', () => {
      const { tenantName, ...withoutTenant } = validData;
      const result = registerSchema.safeParse(withoutTenant);
      expect(result.success).toBe(false);
    });

    it('should require subdomain', () => {
      const { subdomain, ...withoutSubdomain } = validData;
      const result = registerSchema.safeParse(withoutSubdomain);
      expect(result.success).toBe(false);
    });

    it('should validate subdomain format (lowercase, no spaces)', () => {
      const result1 = registerSchema.safeParse({
        ...validData,
        subdomain: 'Test Company', // Spaces not allowed
      });
      expect(result1.success).toBe(false);

      const result2 = registerSchema.safeParse({
        ...validData,
        subdomain: 'TestCompany', // Uppercase not allowed
      });
      expect(result2.success).toBe(false);

      const result3 = registerSchema.safeParse({
        ...validData,
        subdomain: 'test-company', // Valid with hyphen
      });
      expect(result3.success).toBe(true);
    });

    it('should accept valid email formats', () => {
      const emails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-site.com',
      ];

      for (const email of emails) {
        const result = registerSchema.safeParse({
          ...validData,
          email,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('loginSchema', () => {
    const validLogin = {
      email: 'user@example.com',
      password: 'password123',
    };

    it('should validate correct login data', () => {
      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should require email', () => {
      const result = loginSchema.safeParse({ password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });

    it('should require valid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should accept uppercase emails', () => {
      const result = loginSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Email is validated but not transformed
        expect(result.data.email).toBe('USER@EXAMPLE.COM');
      }
    });
  });

  describe('quoteSchema', () => {
    const validQuote = {
      contact_id: '123e4567-e89b-12d3-a456-426614174000',
      valid_until: '2026-12-31',
      items: [
        {
          description: 'Product 1',
          quantity: 2,
          unit_price: 100,
          vat_rate: 20,
        },
      ],
      notes: 'Test quote',
    };

    it('should validate correct quote data', () => {
      const result = quoteSchema.safeParse(validQuote);
      expect(result.success).toBe(true);
    });

    it('should require contact_id', () => {
      const { contact_id, ...without } = validQuote;
      const result = quoteSchema.safeParse(without);
      expect(result.success).toBe(false);
    });

    it('should require valid_until date', () => {
      const { valid_until, ...without } = validQuote;
      const result = quoteSchema.safeParse(without);
      expect(result.success).toBe(false);
    });

    it('should require at least one item', () => {
      const result = quoteSchema.safeParse({
        ...validQuote,
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('should validate item structure', () => {
      const result = quoteSchema.safeParse({
        ...validQuote,
        items: [
          {
            description: 'Product',
            quantity: -1, // Invalid: negative quantity
            unit_price: 100,
            vat_rate: 20,
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional notes', () => {
      const { notes, ...withoutNotes } = validQuote;
      const result = quoteSchema.safeParse(withoutNotes);
      expect(result.success).toBe(true);
    });
  });

  describe('invoiceSchema', () => {
    const validInvoice = {
      contact_id: '123e4567-e89b-12d3-a456-426614174000',
      due_date: '2026-12-31',
      items: [
        {
          description: 'Service 1',
          quantity: 1,
          unit_price: 500,
          vat_rate: 20,
        },
      ],
      siret: '12345678901234',
      tva_number: 'FR12345678901',
      notes: 'Test invoice',
    };

    it('should validate correct invoice data', () => {
      const result = invoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it('should require contact_id', () => {
      const { contact_id, ...without } = validInvoice;
      const result = invoiceSchema.safeParse(without);
      expect(result.success).toBe(false);
    });

    it('should require due_date', () => {
      const { due_date, ...without } = validInvoice;
      const result = invoiceSchema.safeParse(without);
      expect(result.success).toBe(false);
    });

    it('should require at least one item', () => {
      const result = invoiceSchema.safeParse({
        ...validInvoice,
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional quote_id', () => {
      const withQuote = {
        ...validInvoice,
        quote_id: '123e4567-e89b-12d3-a456-426614174001',
      };
      const result = invoiceSchema.safeParse(withQuote);
      expect(result.success).toBe(true);
    });

    it('should allow optional SIRET and TVA', () => {
      const { siret, tva_number, ...minimal } = validInvoice;
      const result = invoiceSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('should validate positive prices', () => {
      const result = invoiceSchema.safeParse({
        ...validInvoice,
        items: [
          {
            description: 'Service',
            quantity: 1,
            unit_price: -100, // Invalid: negative price
            vat_rate: 20,
          },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});

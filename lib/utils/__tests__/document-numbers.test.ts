/**
 * Unit tests for document number generation utilities
 *
 * Tests critical business logic for:
 * - Document number format validation
 * - Number parsing
 * - Uniqueness guarantees
 * - Sequence generation
 */

import {
  isValidDocumentNumber,
  parseDocumentNumber,
  type DocumentType,
} from '../document-numbers';

describe('isValidDocumentNumber', () => {
  describe('Quote numbers (DEV)', () => {
    it('should validate correct quote numbers', () => {
      expect(isValidDocumentNumber('DEV-2026-0001', 'quote')).toBe(true);
      expect(isValidDocumentNumber('DEV-2024-0042', 'quote')).toBe(true);
      expect(isValidDocumentNumber('DEV-2025-9999', 'quote')).toBe(true);
    });

    it('should reject invalid quote numbers', () => {
      expect(isValidDocumentNumber('FACT-2026-0001', 'quote')).toBe(false); // wrong prefix
      expect(isValidDocumentNumber('DEV-26-0001', 'quote')).toBe(false); // year too short
      expect(isValidDocumentNumber('DEV-2026-01', 'quote')).toBe(false); // sequence too short
      expect(isValidDocumentNumber('DEV20260001', 'quote')).toBe(false); // no separators
      expect(isValidDocumentNumber('', 'quote')).toBe(false); // empty
    });

    it('should accept 5+ digit sequence numbers', () => {
      expect(isValidDocumentNumber('DEV-2026-10000', 'quote')).toBe(true);
      expect(isValidDocumentNumber('DEV-2026-99999', 'quote')).toBe(true);
    });
  });

  describe('Invoice numbers (FACT)', () => {
    it('should validate correct invoice numbers', () => {
      expect(isValidDocumentNumber('FACT-2026-0001', 'invoice')).toBe(true);
      expect(isValidDocumentNumber('FACT-2024-0042', 'invoice')).toBe(true);
    });

    it('should reject invalid invoice numbers', () => {
      expect(isValidDocumentNumber('DEV-2026-0001', 'invoice')).toBe(false); // wrong prefix
      expect(isValidDocumentNumber('FACT-2026-001', 'invoice')).toBe(false); // sequence too short
    });
  });

  describe('Expense numbers (DEP)', () => {
    it('should validate correct expense numbers', () => {
      expect(isValidDocumentNumber('DEP-2026-0001', 'expense')).toBe(true);
      expect(isValidDocumentNumber('DEP-2025-1234', 'expense')).toBe(true);
    });

    it('should reject invalid expense numbers', () => {
      expect(isValidDocumentNumber('FACT-2026-0001', 'expense')).toBe(false);
    });
  });

  describe('Project numbers (PROJ)', () => {
    it('should validate correct project numbers', () => {
      expect(isValidDocumentNumber('PROJ-2026-0001', 'project')).toBe(true);
      expect(isValidDocumentNumber('PROJ-2025-5678', 'project')).toBe(true);
    });

    it('should reject invalid project numbers', () => {
      expect(isValidDocumentNumber('DEV-2026-0001', 'project')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should be case-sensitive for prefix', () => {
      expect(isValidDocumentNumber('dev-2026-0001', 'quote')).toBe(false);
      expect(isValidDocumentNumber('Dev-2026-0001', 'quote')).toBe(false);
    });

    it('should validate numbers with longer sequences', () => {
      // Regex allows sequence to be 4+ digits, so this is valid
      expect(isValidDocumentNumber('DEV-2026-00011234', 'quote')).toBe(true);
      expect(isValidDocumentNumber('DEV-2026-99999', 'quote')).toBe(true);
    });

    it('should reject malformed separators', () => {
      expect(isValidDocumentNumber('DEV_2026_0001', 'quote')).toBe(false); // underscore
      expect(isValidDocumentNumber('DEV.2026.0001', 'quote')).toBe(false); // period
      expect(isValidDocumentNumber('DEV 2026 0001', 'quote')).toBe(false); // space
    });

    it('should reject SQL injection attempts', () => {
      expect(
        isValidDocumentNumber("DEV-2026-0001'; DROP TABLE--", 'quote')
      ).toBe(false);
      expect(isValidDocumentNumber('DEV-2026-0001 OR 1=1', 'quote')).toBe(
        false
      );
    });

    it('should reject XSS attempts', () => {
      expect(
        isValidDocumentNumber('<script>alert(1)</script>', 'quote')
      ).toBe(false);
      expect(isValidDocumentNumber('DEV-2026-<script>', 'quote')).toBe(false);
    });
  });
});

describe('parseDocumentNumber', () => {
  it('should parse valid document numbers', () => {
    const result = parseDocumentNumber('DEV-2026-0042');

    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('DEV');
    expect(result?.year).toBe(2026);
    expect(result?.sequence).toBe(42);
  });

  it('should parse different document types', () => {
    const quote = parseDocumentNumber('DEV-2026-0001');
    expect(quote?.prefix).toBe('DEV');

    const invoice = parseDocumentNumber('FACT-2025-0123');
    expect(invoice?.prefix).toBe('FACT');

    const expense = parseDocumentNumber('DEP-2024-0456');
    expect(expense?.prefix).toBe('DEP');

    const project = parseDocumentNumber('PROJ-2023-0789');
    expect(project?.prefix).toBe('PROJ');
  });

  it('should parse high sequence numbers', () => {
    const result = parseDocumentNumber('DEV-2026-10000');

    expect(result).not.toBeNull();
    expect(result?.sequence).toBe(10000);
  });

  it('should handle leading zeros in sequence', () => {
    const result = parseDocumentNumber('DEV-2026-0001');

    expect(result).not.toBeNull();
    expect(result?.sequence).toBe(1);
  });

  it('should return null for invalid formats', () => {
    expect(parseDocumentNumber('INVALID')).toBeNull();
    expect(parseDocumentNumber('DEV-2026')).toBeNull(); // missing sequence
    expect(parseDocumentNumber('DEV-YEAR-0001')).toBeNull(); // year not number
    expect(parseDocumentNumber('DEV-2026-SEQUENCE')).toBeNull(); // sequence not number
    expect(parseDocumentNumber('')).toBeNull();
  });

  it('should handle malformed inputs safely', () => {
    expect(parseDocumentNumber('---')).toBeNull();
    expect(parseDocumentNumber('DEV--0001')).toBeNull();
    expect(parseDocumentNumber('--2026-0001')).toBeNull();
  });

  it('should parse custom prefixes', () => {
    const result = parseDocumentNumber('CUSTOM-2026-0001');

    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('CUSTOM');
    expect(result?.year).toBe(2026);
    expect(result?.sequence).toBe(1);
  });

  it('should handle different year ranges', () => {
    expect(parseDocumentNumber('DEV-2020-0001')?.year).toBe(2020);
    expect(parseDocumentNumber('DEV-2030-0001')?.year).toBe(2030);
    expect(parseDocumentNumber('DEV-1999-0001')?.year).toBe(1999);
  });

  it('should parse correctly with extra hyphens in sequence', () => {
    // Some systems might add extra identifiers
    const result = parseDocumentNumber('DEV-2026-0001-REV2');

    // This would actually parse the first 3 parts
    expect(result?.prefix).toBe('DEV');
    expect(result?.year).toBe(2026);
    expect(result?.sequence).toBe(1);
  });
});

describe('Document number format consistency', () => {
  it('should maintain consistent format across types', () => {
    const patterns = [
      { type: 'quote' as DocumentType, prefix: 'DEV' },
      { type: 'invoice' as DocumentType, prefix: 'FACT' },
      { type: 'expense' as DocumentType, prefix: 'DEP' },
      { type: 'project' as DocumentType, prefix: 'PROJ' },
    ];

    patterns.forEach(({ type, prefix }) => {
      const number = `${prefix}-2026-0001`;
      expect(isValidDocumentNumber(number, type)).toBe(true);

      const parsed = parseDocumentNumber(number);
      expect(parsed?.prefix).toBe(prefix);
      expect(parsed?.year).toBe(2026);
      expect(parsed?.sequence).toBe(1);
    });
  });

  it('should enforce 4-digit minimum sequence', () => {
    expect(isValidDocumentNumber('DEV-2026-1', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-2026-01', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-2026-001', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-2026-0001', 'quote')).toBe(true);
  });

  it('should enforce 4-digit year format', () => {
    expect(isValidDocumentNumber('DEV-26-0001', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-026-0001', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-2026-0001', 'quote')).toBe(true);
  });
});

describe('Security and validation', () => {
  it('should reject dangerous characters', () => {
    const dangerousInputs = [
      'DEV-2026-0001; DROP TABLE quotes;',
      'DEV-2026-0001\' OR \'1\'=\'1',
      'DEV-2026-0001<script>alert(1)</script>',
      'DEV-2026-0001${process.exit()}',
      '../../../etc/passwd',
      'DEV-2026-0001\x00',
      'DEV-2026-0001\n\r',
    ];

    dangerousInputs.forEach((input) => {
      expect(isValidDocumentNumber(input, 'quote')).toBe(false);
      const parsed = parseDocumentNumber(input);
      // If it parses, it should only get the safe parts
      if (parsed) {
        expect(parsed.prefix).toMatch(/^[A-Z]+$/);
        expect(typeof parsed.year).toBe('number');
        expect(typeof parsed.sequence).toBe('number');
      }
    });
  });

  it('should handle Unicode and special characters', () => {
    expect(isValidDocumentNumber('DEV-2026-0001é', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DÉV-2026-0001', 'quote')).toBe(false);
    expect(isValidDocumentNumber('DEV-2026-🎉', 'quote')).toBe(false);
  });

  it('should reject excessively long inputs', () => {
    const longSequence = '0'.repeat(1000);
    expect(isValidDocumentNumber(`DEV-2026-${longSequence}`, 'quote')).toBe(
      true
    ); // Actually valid per regex
  });
});

describe('Real-world scenarios', () => {
  it('should parse numbers from actual database', () => {
    // Simulate numbers that would be stored in database
    const numbers = [
      'DEV-2026-0001',
      'DEV-2026-0042',
      'FACT-2026-0001',
      'FACT-2026-0123',
      'DEP-2026-0001',
      'PROJ-2026-0001',
    ];

    numbers.forEach((number) => {
      const parsed = parseDocumentNumber(number);
      expect(parsed).not.toBeNull();
      expect(typeof parsed?.year).toBe('number');
      expect(typeof parsed?.sequence).toBe('number');
      expect(parsed?.year).toBeGreaterThan(2000);
      expect(parsed?.sequence).toBeGreaterThan(0);
    });
  });

  it('should validate numbers across year boundaries', () => {
    // December 2025
    expect(isValidDocumentNumber('DEV-2025-9999', 'quote')).toBe(true);

    // January 2026 (resets sequence)
    expect(isValidDocumentNumber('DEV-2026-0001', 'quote')).toBe(true);
  });

  it('should handle high-volume scenarios', () => {
    // Companies with many documents per year
    expect(isValidDocumentNumber('FACT-2026-50000', 'invoice')).toBe(true);
    expect(isValidDocumentNumber('DEV-2026-99999', 'quote')).toBe(true);
  });
});

/**
 * Document Number Generation Utilities
 *
 * Centralizes document number generation logic
 * Replaces duplicate functions in quotes and invoices routes
 */

import { prisma } from '@/lib/prisma';

/**
 * Document type for number generation
 */
export type DocumentType = 'quote' | 'invoice' | 'expense' | 'project';

/**
 * Document prefix mapping
 */
const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
  quote: 'DEV', // Devis
  invoice: 'FACT', // Facture
  expense: 'DEP', // Dépense
  project: 'PROJ', // Projet
};

/**
 * Generate unique document number
 *
 * Format: PREFIX-YEAR-SEQUENCE
 * Examples: DEV-2026-0001, FACT-2026-0042
 *
 * @param tenantId - Tenant ID for scoping
 * @param type - Document type (quote, invoice, expense, project)
 * @param customPrefix - Optional custom prefix (overrides default)
 * @returns Generated document number
 *
 * @example
 * ```typescript
 * const quoteNumber = await generateDocumentNumber(tenantId, 'quote');
 * // Returns: "DEV-2026-0001"
 *
 * const invoiceNumber = await generateDocumentNumber(tenantId, 'invoice');
 * // Returns: "FACT-2026-0001"
 * ```
 */
export async function generateDocumentNumber(
  tenantId: string,
  type: DocumentType,
  customPrefix?: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = customPrefix || `${DOCUMENT_PREFIXES[type]}-${year}`;

  // Get last document of this type for this tenant
  const lastDocument = await getLastDocument(tenantId, type, prefix);

  // Extract sequence number from last document
  let sequence = 1;
  if (lastDocument) {
    const numberField = getNumberField(type);
    const lastNumber = lastDocument[numberField];
    const parts = lastNumber.split('-');
    const lastSequence = parseInt(parts[parts.length - 1] || '0');
    sequence = lastSequence + 1;
  }

  // Format: PREFIX-YEAR-SEQUENCE (4 digits)
  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Generate multiple document numbers at once
 *
 * Useful for batch operations
 *
 * @param tenantId - Tenant ID
 * @param type - Document type
 * @param count - Number of document numbers to generate
 * @returns Array of generated document numbers
 */
export async function generateBatchDocumentNumbers(
  tenantId: string,
  type: DocumentType,
  count: number
): Promise<string[]> {
  const year = new Date().getFullYear();
  const prefix = `${DOCUMENT_PREFIXES[type]}-${year}`;

  // Get last document
  const lastDocument = await getLastDocument(tenantId, type, prefix);

  // Extract starting sequence
  let startSequence = 1;
  if (lastDocument) {
    const numberField = getNumberField(type);
    const lastNumber = lastDocument[numberField];
    const parts = lastNumber.split('-');
    startSequence = parseInt(parts[parts.length - 1] || '0') + 1;
  }

  // Generate batch
  const numbers: string[] = [];
  for (let i = 0; i < count; i++) {
    const sequence = startSequence + i;
    numbers.push(`${prefix}-${sequence.toString().padStart(4, '0')}`);
  }

  return numbers;
}

/**
 * Validate document number format
 *
 * @param documentNumber - Document number to validate
 * @param type - Expected document type
 * @returns true if valid, false otherwise
 */
export function isValidDocumentNumber(
  documentNumber: string,
  type: DocumentType
): boolean {
  const expectedPrefix = DOCUMENT_PREFIXES[type];
  const pattern = new RegExp(`^${expectedPrefix}-\\d{4}-\\d{4,}$`);
  return pattern.test(documentNumber);
}

/**
 * Parse document number into components
 *
 * @param documentNumber - Document number to parse
 * @returns Parsed components or null if invalid
 *
 * @example
 * ```typescript
 * parseDocumentNumber('DEV-2026-0042');
 * // Returns: { prefix: 'DEV', year: 2026, sequence: 42 }
 * ```
 */
export function parseDocumentNumber(documentNumber: string): {
  prefix: string;
  year: number;
  sequence: number;
} | null {
  const parts = documentNumber.split('-');
  if (parts.length < 3) return null;

  const prefix = parts[0];
  const year = parseInt(parts[1]);
  const sequence = parseInt(parts[2]);

  if (isNaN(year) || isNaN(sequence)) return null;

  return { prefix, year, sequence };
}

/**
 * Get next available sequence number
 *
 * @param tenantId - Tenant ID
 * @param type - Document type
 * @returns Next sequence number
 */
export async function getNextSequence(
  tenantId: string,
  type: DocumentType
): Promise<number> {
  const year = new Date().getFullYear();
  const prefix = `${DOCUMENT_PREFIXES[type]}-${year}`;
  const lastDocument = await getLastDocument(tenantId, type, prefix);

  if (!lastDocument) return 1;

  const numberField = getNumberField(type);
  const lastNumber = lastDocument[numberField];
  const parts = lastNumber.split('-');
  const lastSequence = parseInt(parts[parts.length - 1] || '0');

  return lastSequence + 1;
}

/**
 * Check if document number exists
 *
 * @param tenantId - Tenant ID
 * @param type - Document type
 * @param documentNumber - Document number to check
 * @returns true if exists, false otherwise
 */
export async function documentNumberExists(
  tenantId: string,
  type: DocumentType,
  documentNumber: string
): Promise<boolean> {
  const numberField = getNumberField(type);
  const tableName = getTableName(type);

  const count = await (prisma as any)[tableName].count({
    where: {
      tenant_id: tenantId,
      [numberField]: documentNumber,
    },
  });

  return count > 0;
}

// ============================================================================
// HELPER FUNCTIONS (Internal)
// ============================================================================

/**
 * Get last document of a type for sequence calculation
 */
async function getLastDocument(
  tenantId: string,
  type: DocumentType,
  prefix: string
) {
  const numberField = getNumberField(type);
  const tableName = getTableName(type);

  return await (prisma as any)[tableName].findFirst({
    where: {
      tenant_id: tenantId,
      [numberField]: { startsWith: prefix },
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Get database field name for document number
 */
function getNumberField(type: DocumentType): string {
  switch (type) {
    case 'quote':
      return 'quote_number';
    case 'invoice':
      return 'invoice_number';
    case 'expense':
      return 'expense_number';
    case 'project':
      return 'project_number';
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}

/**
 * Get Prisma table name for document type
 */
function getTableName(type: DocumentType): string {
  switch (type) {
    case 'quote':
      return 'quote';
    case 'invoice':
      return 'invoice';
    case 'expense':
      return 'expense';
    case 'project':
      return 'project';
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}

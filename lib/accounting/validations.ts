import { z } from 'zod';

// ===================================================================
// Bank Account Validations
// ===================================================================

export const bankAccountSchema = z.object({
  account_name: z.string().min(1, 'Le nom du compte est requis').max(255),
  account_number: z.string().min(1, 'Le numéro de compte est requis').max(50),
  iban: z.string().max(34).optional().nullable(),
  bic: z.string().max(11).optional().nullable(),
  bank_name: z.string().min(1, 'Le nom de la banque est requis').max(255),
  account_type: z.string().max(50).default('CHECKING'),
  balance: z.number().default(0),
  currency: z.string().length(3).default('EUR'),
  is_active: z.boolean().default(true),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// ===================================================================
// Bank Transaction Validations
// ===================================================================

export const bankTransactionSchema = z.object({
  account_id: z.string().uuid('ID de compte invalide'),
  date: z.string().or(z.date()),
  amount: z.number().positive('Le montant doit être positif'),
  type: z.enum(['DEBIT', 'CREDIT']),
  description: z.string().min(1, 'La description est requise').max(500),
  reference: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  linked_invoice_id: z.string().uuid().optional().nullable(),
  linked_expense_id: z.string().uuid().optional().nullable(),
  status: z.enum(['PENDING', 'RECONCILED', 'REJECTED']).default('PENDING'),
  metadata: z.record(z.any()).optional().nullable(),
});

export type BankTransactionFormData = z.infer<typeof bankTransactionSchema>;

// ===================================================================
// Bank Reconciliation Validations
// ===================================================================

export const bankReconciliationSchema = z.object({
  account_id: z.string().uuid('ID de compte invalide'),
  reconciliation_date: z.string().or(z.date()),
  statement_balance: z.number(),
  notes: z.string().optional().nullable(),
  document_url: z.string().url().max(500).optional().nullable(),
});

export type BankReconciliationFormData = z.infer<typeof bankReconciliationSchema>;

// ===================================================================
// Expense Validations
// ===================================================================

export const expenseSchema = z.object({
  date: z.string().or(z.date()),
  vendor_id: z.string().uuid().optional().nullable(),
  vendor_name: z.string().min(1, 'Le nom du fournisseur est requis').max(255),
  category: z.enum([
    'RENT',
    'UTILITIES',
    'INSURANCE',
    'OFFICE_SUPPLIES',
    'MAINTENANCE',
    'FUEL',
    'VEHICLE',
    'MARKETING',
    'SALARIES',
    'TAXES',
    'RESTAURANT',
    'TRAVEL',
    'EQUIPMENT',
    'SOFTWARE',
    'PROFESSIONAL_FEES',
    'BANK_FEES',
    'INVENTORY',
    'OTHER',
  ]),
  description: z.string().min(1, 'La description est requise').max(500),
  amount_ht: z.number().positive('Le montant HT doit être positif'),
  vat_rate: z.number().min(0).max(100).default(20.0),
  payment_method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'CHECK']).optional().nullable(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'REJECTED']).default('DRAFT'),
  notes: z.string().optional().nullable(),
  receipt_url: z.string().url().max(500).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
}).transform((data) => {
  // Auto-calculate VAT and total
  const vat_amount = (data.amount_ht * data.vat_rate) / 100;
  const amount_ttc = data.amount_ht + vat_amount;

  return {
    ...data,
    vat_amount,
    amount_ttc,
  };
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// ===================================================================
// Inventory Item Validations
// ===================================================================

export const inventoryItemSchema = z.object({
  catalog_item_id: z.string().uuid().optional().nullable(),
  sku: z.string().min(1, 'Le SKU est requis').max(100),
  name: z.string().min(1, 'Le nom est requis').max(255),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'La catégorie est requise').max(100),
  quantity: z.number().int().min(0).default(0),
  unit_cost: z.number().min(0, 'Le coût unitaire doit être positif'),
  reorder_point: z.number().int().min(0).default(0),
  location: z.string().max(255).optional().nullable(),
  depreciation_rate: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
}).transform((data) => {
  // Auto-calculate total value and depreciated value
  const total_value = data.unit_cost * data.quantity;
  const depreciated_value = data.depreciation_rate
    ? total_value * (1 - data.depreciation_rate / 100)
    : null;

  return {
    ...data,
    total_value,
    depreciated_value,
  };
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

// ===================================================================
// Tax Document Validations
// ===================================================================

export const taxDocumentSchema = z.object({
  type: z.enum([
    'TVA_RETURN',
    'CORPORATE_TAX',
    'INCOME_TAX',
    'PAYROLL_TAX',
    'PROPERTY_TAX',
    'FEC',
    'LIASSE_FISCALE',
    'OTHER',
  ]),
  period: z.string().min(1, 'La période est requise').max(10),
  year: z.number().int().min(2000).max(2100),
  file_url: z.string().url('URL invalide').max(500),
  file_name: z.string().min(1, 'Le nom du fichier est requis').max(255),
  file_size: z.number().int().positive().optional().nullable(),
  amount: z.number().optional().nullable(),
  submitted: z.boolean().default(false),
  submitted_at: z.string().or(z.date()).optional().nullable(),
  due_date: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type TaxDocumentFormData = z.infer<typeof taxDocumentSchema>;

// ===================================================================
// Payroll Document Validations
// ===================================================================

export const payrollDocumentSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format de mois invalide (YYYY-MM)'),
  year: z.number().int().min(2000).max(2100),
  total_gross_wages: z.number().min(0, 'Le montant brut doit être positif'),
  total_net_wages: z.number().min(0, 'Le montant net doit être positif'),
  total_social_charges: z.number().min(0, 'Les charges sociales doivent être positives'),
  employee_count: z.number().int().min(0).default(0),
  vacation_provision: z.number().min(0).optional().nullable(),
  file_url: z.string().url().max(500).optional().nullable(),
  file_name: z.string().max(255).optional().nullable(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'PAID']).default('DRAFT'),
  paid_at: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type PayrollDocumentFormData = z.infer<typeof payrollDocumentSchema>;

// ===================================================================
// Legal Document Validations
// ===================================================================

export const legalDocumentSchema = z.object({
  type: z.enum([
    'CONTRACT',
    'CERTIFICATE',
    'INSURANCE',
    'REGISTRATION',
    'LICENSE',
    'KBIS',
    'STATUTES',
    'AGO_PV',
    'RCM_DECLARATION',
    'LEASE',
    'OTHER',
  ]),
  name: z.string().min(1, 'Le nom est requis').max(255),
  reference: z.string().max(100).optional().nullable(),
  file_url: z.string().url('URL invalide').max(500),
  file_name: z.string().min(1, 'Le nom du fichier est requis').max(255),
  file_size: z.number().int().positive().optional().nullable(),
  issue_date: z.string().or(z.date()).optional().nullable(),
  expiry_date: z.string().or(z.date()).optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type LegalDocumentFormData = z.infer<typeof legalDocumentSchema>;

// ===================================================================
// Litigation Validations
// ===================================================================

export const litigationSchema = z.object({
  case_number: z.string().max(100).optional().nullable(),
  type: z.string().min(1, 'Le type de litige est requis').max(50),
  party_name: z.string().min(1, 'Le nom de la partie est requis').max(255),
  subject: z.string().min(1, 'Le sujet est requis').max(500),
  description: z.string().optional().nullable(),
  amount_disputed: z.number().optional().nullable(),
  provision_amount: z.number().optional().nullable(),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['ONGOING', 'SETTLED', 'CLOSED', 'WON', 'LOST']).default('ONGOING'),
  start_date: z.string().or(z.date()),
  expected_end_date: z.string().or(z.date()).optional().nullable(),
  actual_end_date: z.string().or(z.date()).optional().nullable(),
  lawyer_name: z.string().max(255).optional().nullable(),
  lawyer_fees: z.number().min(0).optional().nullable(),
  outcome: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type LitigationFormData = z.infer<typeof litigationSchema>;

// ===================================================================
// Financial Report Validations (Read-only, generated)
// ===================================================================

export const financialReportSchema = z.object({
  period: z.string().min(1).max(10),
  year: z.number().int(),
  month: z.number().int().min(1).max(12).optional().nullable(),
  total_revenue: z.number(),
  total_expenses: z.number(),
  total_vat_collected: z.number(),
  total_vat_paid: z.number(),
  net_vat_due: z.number(),
  gross_profit: z.number(),
  net_profit: z.number(),
  cash_flow: z.number(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type FinancialReportData = z.infer<typeof financialReportSchema>;

// ===================================================================
// Bulk Import Schemas
// ===================================================================

export const bulkTransactionImportSchema = z.object({
  account_id: z.string().uuid(),
  transactions: z.array(
    z.object({
      date: z.string().or(z.date()),
      amount: z.number(),
      type: z.enum(['DEBIT', 'CREDIT']),
      description: z.string().max(500),
      reference: z.string().max(100).optional(),
    })
  ),
});

export type BulkTransactionImportData = z.infer<typeof bulkTransactionImportSchema>;

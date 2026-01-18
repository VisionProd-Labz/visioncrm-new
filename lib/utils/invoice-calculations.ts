/**
 * Invoice and Quote Calculation Utilities
 *
 * Centralizes calculation logic duplicated across 6+ files
 * Used by: quotes, invoices, expenses, components
 */

/**
 * Line item structure for calculations
 */
export interface LineItem {
  quantity: number;
  unit_price: number;
  vat_rate?: number;
  discount?: number;
}

/**
 * Calculation result structure
 */
export interface CalculatedTotals {
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  discount_amount?: number;
  total: number;
}

/**
 * Calculate totals from line items
 *
 * @param items - Array of line items with quantity and unit_price
 * @param defaultVatRate - Default VAT rate if not specified in items (default: 20%)
 * @returns Calculated totals with subtotal, VAT, and total
 *
 * @example
 * ```typescript
 * const items = [
 *   { quantity: 2, unit_price: 100, vat_rate: 20 },
 *   { quantity: 1, unit_price: 50, vat_rate: 20 }
 * ];
 * const totals = calculateTotals(items);
 * // { subtotal: 250, vat_rate: 20, vat_amount: 50, total: 300 }
 * ```
 */
export function calculateTotals(
  items: LineItem[],
  defaultVatRate: number = 20
): CalculatedTotals {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      vat_rate: defaultVatRate,
      vat_amount: 0,
      total: 0,
    };
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    const discount = item.discount || 0;
    return sum + itemTotal - discount;
  }, 0);

  // Use VAT rate from first item or default
  const vatRate = items[0]?.vat_rate ?? defaultVatRate;

  // Calculate VAT amount
  const vatAmount = (subtotal * vatRate) / 100;

  // Calculate total
  const total = subtotal + vatAmount;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    vat_rate: vatRate,
    vat_amount: roundToTwoDecimals(vatAmount),
    total: roundToTwoDecimals(total),
  };
}

/**
 * Calculate totals with per-item VAT rates
 *
 * Handles cases where each item has different VAT rates
 *
 * @param items - Array of line items with individual VAT rates
 * @returns Calculated totals with weighted average VAT rate
 *
 * @example
 * ```typescript
 * const items = [
 *   { quantity: 2, unit_price: 100, vat_rate: 20 },
 *   { quantity: 1, unit_price: 50, vat_rate: 5.5 }
 * ];
 * const totals = calculateTotalsWithMixedVat(items);
 * ```
 */
export function calculateTotalsWithMixedVat(
  items: LineItem[]
): CalculatedTotals {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total: 0,
    };
  }

  let subtotal = 0;
  let totalVatAmount = 0;

  // Calculate per-item totals and VAT
  items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const discount = item.discount || 0;
    const itemSubtotalAfterDiscount = itemSubtotal - discount;
    const vatRate = item.vat_rate ?? 20;
    const itemVatAmount = (itemSubtotalAfterDiscount * vatRate) / 100;

    subtotal += itemSubtotalAfterDiscount;
    totalVatAmount += itemVatAmount;
  });

  // Calculate weighted average VAT rate
  const averageVatRate = subtotal > 0 ? (totalVatAmount / subtotal) * 100 : 20;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    vat_rate: roundToTwoDecimals(averageVatRate),
    vat_amount: roundToTwoDecimals(totalVatAmount),
    total: roundToTwoDecimals(subtotal + totalVatAmount),
  };
}

/**
 * Calculate discount amount from percentage
 *
 * @param subtotal - Subtotal amount
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discount amount
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountPercent: number
): number {
  if (discountPercent <= 0 || discountPercent > 100) {
    return 0;
  }
  return roundToTwoDecimals((subtotal * discountPercent) / 100);
}

/**
 * Calculate total with discount
 *
 * @param subtotal - Subtotal amount
 * @param discountPercent - Discount percentage
 * @param vatRate - VAT rate percentage
 * @returns Calculated totals with discount applied
 */
export function calculateTotalsWithDiscount(
  subtotal: number,
  discountPercent: number,
  vatRate: number = 20
): CalculatedTotals {
  const discountAmount = calculateDiscountAmount(subtotal, discountPercent);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const vatAmount = (subtotalAfterDiscount * vatRate) / 100;
  const total = subtotalAfterDiscount + vatAmount;

  return {
    subtotal: roundToTwoDecimals(subtotalAfterDiscount),
    vat_rate: vatRate,
    vat_amount: roundToTwoDecimals(vatAmount),
    discount_amount: roundToTwoDecimals(discountAmount),
    total: roundToTwoDecimals(total),
  };
}

/**
 * Calculate VAT amount from total (reverse calculation)
 *
 * Useful when you have total amount and need to extract VAT
 *
 * @param totalIncludingVat - Total amount including VAT
 * @param vatRate - VAT rate percentage
 * @returns Object with subtotal, VAT amount, and total
 */
export function extractVatFromTotal(
  totalIncludingVat: number,
  vatRate: number = 20
): CalculatedTotals {
  const subtotal = totalIncludingVat / (1 + vatRate / 100);
  const vatAmount = totalIncludingVat - subtotal;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    vat_rate: vatRate,
    vat_amount: roundToTwoDecimals(vatAmount),
    total: roundToTwoDecimals(totalIncludingVat),
  };
}

/**
 * Format currency amount for display
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: EUR)
 * @param locale - Locale for formatting (default: fr-FR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Round number to 2 decimal places
 *
 * @param value - Number to round
 * @returns Rounded number
 */
function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Validate line item
 *
 * @param item - Line item to validate
 * @returns true if valid, false otherwise
 */
export function isValidLineItem(item: LineItem): boolean {
  return (
    typeof item.quantity === 'number' &&
    typeof item.unit_price === 'number' &&
    item.quantity > 0 &&
    item.unit_price >= 0 &&
    (item.vat_rate === undefined ||
      (item.vat_rate >= 0 && item.vat_rate <= 100))
  );
}

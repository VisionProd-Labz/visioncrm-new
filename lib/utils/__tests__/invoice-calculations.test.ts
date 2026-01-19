/**
 * Unit tests for invoice and quote calculation utilities
 *
 * Tests critical business logic for:
 * - Subtotal calculations
 * - VAT calculations
 * - Discount applications
 * - Mixed VAT rates
 * - Currency formatting
 */

import {
  calculateTotals,
  calculateTotalsWithMixedVat,
  calculateDiscountAmount,
  calculateTotalsWithDiscount,
  extractVatFromTotal,
  formatCurrency,
  isValidLineItem,
  type LineItem,
} from '../invoice-calculations';

describe('calculateTotals', () => {
  it('should calculate totals correctly for simple items', () => {
    const items: LineItem[] = [
      { quantity: 2, unit_price: 100, vat_rate: 20 },
      { quantity: 1, unit_price: 50, vat_rate: 20 },
    ];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(250);
    expect(result.vat_rate).toBe(20);
    expect(result.vat_amount).toBe(50);
    expect(result.total).toBe(300);
  });

  it('should handle empty items array', () => {
    const result = calculateTotals([]);

    expect(result.subtotal).toBe(0);
    expect(result.vat_rate).toBe(20); // default
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should use default VAT rate when not specified', () => {
    const items: LineItem[] = [{ quantity: 1, unit_price: 100 }];

    const result = calculateTotals(items, 19);

    expect(result.vat_rate).toBe(19);
    expect(result.vat_amount).toBe(19);
    expect(result.total).toBe(119);
  });

  it('should handle discounts in line items', () => {
    const items: LineItem[] = [
      { quantity: 2, unit_price: 100, vat_rate: 20, discount: 20 },
    ];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(180); // (2 * 100) - 20
    expect(result.vat_amount).toBe(36); // 180 * 0.20
    expect(result.total).toBe(216);
  });

  it('should round to 2 decimal places', () => {
    const items: LineItem[] = [
      { quantity: 3, unit_price: 33.33, vat_rate: 20 },
    ];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(99.99);
    expect(result.vat_amount).toBe(20); // (99.99 * 0.20) = 19.998 rounded to 20
    expect(result.total).toBe(119.99);
  });

  it('should handle zero quantity items', () => {
    const items: LineItem[] = [{ quantity: 0, unit_price: 100, vat_rate: 20 }];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(0);
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should handle zero price items', () => {
    const items: LineItem[] = [{ quantity: 5, unit_price: 0, vat_rate: 20 }];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(0);
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('calculateTotalsWithMixedVat', () => {
  it('should handle items with different VAT rates', () => {
    const items: LineItem[] = [
      { quantity: 2, unit_price: 100, vat_rate: 20 }, // 200 with 40 VAT
      { quantity: 1, unit_price: 50, vat_rate: 5.5 }, // 50 with 2.75 VAT
    ];

    const result = calculateTotalsWithMixedVat(items);

    expect(result.subtotal).toBe(250);
    expect(result.vat_amount).toBe(42.75); // 40 + 2.75
    expect(result.total).toBe(292.75);
    // Weighted average VAT rate: (42.75 / 250) * 100 = 17.1%
    expect(result.vat_rate).toBe(17.1);
  });

  it('should handle discounts per item', () => {
    const items: LineItem[] = [
      { quantity: 1, unit_price: 100, vat_rate: 20, discount: 10 },
      { quantity: 1, unit_price: 50, vat_rate: 10, discount: 5 },
    ];

    const result = calculateTotalsWithMixedVat(items);

    expect(result.subtotal).toBe(135); // (100 - 10) + (50 - 5)
    expect(result.vat_amount).toBe(22.5); // (90 * 0.20) + (45 * 0.10)
    expect(result.total).toBe(157.5);
  });

  it('should use default VAT rate when not specified', () => {
    const items: LineItem[] = [{ quantity: 1, unit_price: 100 }];

    const result = calculateTotalsWithMixedVat(items);

    expect(result.vat_rate).toBe(20); // default
    expect(result.vat_amount).toBe(20);
  });

  it('should handle empty items', () => {
    const result = calculateTotalsWithMixedVat([]);

    expect(result.subtotal).toBe(0);
    expect(result.vat_rate).toBe(20);
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('calculateDiscountAmount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscountAmount(100, 10)).toBe(10);
    expect(calculateDiscountAmount(250, 15)).toBe(37.5);
    expect(calculateDiscountAmount(99.99, 5)).toBe(5);
  });

  it('should return 0 for invalid discount percentages', () => {
    expect(calculateDiscountAmount(100, 0)).toBe(0);
    expect(calculateDiscountAmount(100, -5)).toBe(0);
    expect(calculateDiscountAmount(100, 101)).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    expect(calculateDiscountAmount(33.33, 33.33)).toBe(11.11);
  });
});

describe('calculateTotalsWithDiscount', () => {
  it('should apply discount before VAT', () => {
    const result = calculateTotalsWithDiscount(100, 10, 20);

    expect(result.subtotal).toBe(90); // 100 - 10%
    expect(result.discount_amount).toBe(10);
    expect(result.vat_amount).toBe(18); // 90 * 20%
    expect(result.total).toBe(108);
  });

  it('should handle zero discount', () => {
    const result = calculateTotalsWithDiscount(100, 0, 20);

    expect(result.subtotal).toBe(100);
    expect(result.discount_amount).toBe(0);
    expect(result.vat_amount).toBe(20);
    expect(result.total).toBe(120);
  });

  it('should handle 100% discount', () => {
    const result = calculateTotalsWithDiscount(100, 100, 20);

    expect(result.subtotal).toBe(0);
    expect(result.discount_amount).toBe(100);
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should use default VAT rate', () => {
    const result = calculateTotalsWithDiscount(100, 10);

    expect(result.vat_rate).toBe(20);
  });
});

describe('extractVatFromTotal', () => {
  it('should extract VAT from total amount', () => {
    const result = extractVatFromTotal(120, 20);

    expect(result.subtotal).toBe(100);
    expect(result.vat_amount).toBe(20);
    expect(result.total).toBe(120);
  });

  it('should handle different VAT rates', () => {
    const result = extractVatFromTotal(119, 19);

    expect(result.subtotal).toBe(100);
    expect(result.vat_amount).toBe(19);
    expect(result.total).toBe(119);
  });

  it('should handle zero total', () => {
    const result = extractVatFromTotal(0, 20);

    expect(result.subtotal).toBe(0);
    expect(result.vat_amount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should use default VAT rate', () => {
    const result = extractVatFromTotal(120);

    expect(result.vat_rate).toBe(20);
  });

  it('should round to 2 decimal places', () => {
    const result = extractVatFromTotal(99.99, 20);

    expect(result.subtotal).toBe(83.33); // 99.99 / 1.20
    expect(result.vat_amount).toBe(16.66); // 99.99 - 83.33
  });
});

describe('formatCurrency', () => {
  it('should format EUR currency in French locale', () => {
    // The exact format may vary based on locale/system, but should contain the amount
    const formatted = formatCurrency(1234.56);
    expect(formatted).toContain('1');
    expect(formatted).toContain('234');
    expect(formatted).toContain('56');
    expect(formatted).toContain('€');

    const formatted100 = formatCurrency(100);
    expect(formatted100).toContain('100');
    expect(formatted100).toContain('€');
  });

  it('should handle different currencies', () => {
    expect(formatCurrency(100, 'USD', 'en-US')).toBe('$100.00');
    expect(formatCurrency(100, 'GBP', 'en-GB')).toBe('£100.00');
  });

  it('should handle zero amounts', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('-');
    expect(result).toContain('50');
    expect(result).toContain('€');
  });

  it('should handle large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toContain('000');
    expect(result).toContain('€');
  });
});

describe('isValidLineItem', () => {
  it('should validate correct line items', () => {
    expect(
      isValidLineItem({ quantity: 1, unit_price: 100, vat_rate: 20 })
    ).toBe(true);
    expect(isValidLineItem({ quantity: 5, unit_price: 0 })).toBe(true);
  });

  it('should reject negative quantities', () => {
    expect(
      isValidLineItem({ quantity: -1, unit_price: 100, vat_rate: 20 })
    ).toBe(false);
  });

  it('should reject zero quantities', () => {
    expect(
      isValidLineItem({ quantity: 0, unit_price: 100, vat_rate: 20 })
    ).toBe(false);
  });

  it('should reject negative unit prices', () => {
    expect(
      isValidLineItem({ quantity: 1, unit_price: -100, vat_rate: 20 })
    ).toBe(false);
  });

  it('should reject invalid VAT rates', () => {
    expect(
      isValidLineItem({ quantity: 1, unit_price: 100, vat_rate: -1 })
    ).toBe(false);
    expect(
      isValidLineItem({ quantity: 1, unit_price: 100, vat_rate: 101 })
    ).toBe(false);
  });

  it('should accept items without VAT rate', () => {
    expect(isValidLineItem({ quantity: 1, unit_price: 100 })).toBe(true);
  });

  it('should reject non-number quantities', () => {
    expect(
      isValidLineItem({ quantity: '1' as any, unit_price: 100 })
    ).toBe(false);
  });

  it('should reject non-number unit prices', () => {
    expect(
      isValidLineItem({ quantity: 1, unit_price: '100' as any })
    ).toBe(false);
  });
});

describe('Edge cases and precision', () => {
  it('should handle very small amounts', () => {
    const items: LineItem[] = [
      { quantity: 1, unit_price: 0.01, vat_rate: 20 },
    ];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(0.01);
    expect(result.vat_amount).toBe(0); // rounds down from 0.002
    expect(result.total).toBe(0.01);
  });

  it('should handle large quantities', () => {
    const items: LineItem[] = [
      { quantity: 1000, unit_price: 999.99, vat_rate: 20 },
    ];

    const result = calculateTotals(items);

    expect(result.subtotal).toBe(999990);
    expect(result.vat_amount).toBe(199998);
    expect(result.total).toBe(1199988);
  });

  it('should maintain precision across complex calculations', () => {
    const items: LineItem[] = [
      { quantity: 3, unit_price: 33.33, vat_rate: 19, discount: 5 },
      { quantity: 2, unit_price: 66.67, vat_rate: 5.5, discount: 10 },
    ];

    const result = calculateTotalsWithMixedVat(items);

    // Should not accumulate floating point errors
    expect(typeof result.subtotal).toBe('number');
    expect(typeof result.vat_amount).toBe('number');
    expect(typeof result.total).toBe('number');
    // Total should equal subtotal + VAT (within floating point precision)
    expect(result.total).toBeCloseTo(result.subtotal + result.vat_amount, 2);
  });
});

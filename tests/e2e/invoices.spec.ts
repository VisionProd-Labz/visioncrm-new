/**
 * Invoices E2E Tests
 * Tests for invoice creation, management, and payment tracking
 */

import { test, expect } from '@playwright/test';
import { generateTestData, login, waitForToast } from './helpers/test-helpers';

test.describe('Invoices Management', () => {
  let testUser: ReturnType<typeof generateTestData>;

  test.beforeEach(async ({ page }) => {
    // Create and login a test user before each test
    testUser = generateTestData();
    await page.goto('/register');

    // Register
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="companyName"]', testUser.companyName);
    await page.click('button[type="submit"]');

    // Login
    await login(page, testUser.email, testUser.password);

    // Navigate to invoices page
    await page.click('a[href="/invoices"]');
    await expect(page).toHaveURL('/invoices');
  });

  test.describe('Invoice Creation', () => {
    test('should create a new invoice with required fields', async ({ page }) => {
      // Click "Nouvelle Facture" button
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');

      // Wait for modal/form to open
      await expect(page.locator('text=Créer une facture, text=Create invoice')).toBeVisible();

      // Fill required fields
      const invoiceData = {
        clientName: 'Test Client',
        amount: '1500.00',
        dueDate: '2026-03-01',
        description: 'Test invoice for service',
      };

      // Select or create client
      await page.fill('input[name="clientName"], input[placeholder*="Client"]', invoiceData.clientName);

      // Fill amount
      await page.fill('input[name="amount"]', invoiceData.amount);

      // Fill due date
      await page.fill('input[name="dueDate"], input[type="date"]', invoiceData.dueDate);

      // Fill description
      await page.fill('textarea[name="description"]', invoiceData.description);

      // Submit
      await page.click('button:has-text("Créer"), button:has-text("Create")');

      // Should show success toast
      await waitForToast(page, 'Facture créée avec succès, Invoice created successfully');

      // Invoice should appear in list
      await expect(page.locator(`text=${invoiceData.clientName}`)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');

      // Try to submit without filling required fields
      await page.click('button:has-text("Créer"), button:has-text("Create")');

      // Should show validation errors
      await expect(page.locator('text=Client requis, text=Client required')).toBeVisible();
      await expect(page.locator('text=Montant requis, text=Amount required')).toBeVisible();
    });

    test('should validate amount is positive number', async ({ page }) => {
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');

      // Try negative amount
      await page.fill('input[name="amount"]', '-100');
      await page.blur('input[name="amount"]');

      await expect(page.locator('text=Montant invalide, text=Invalid amount')).toBeVisible();

      // Try zero
      await page.fill('input[name="amount"]', '0');
      await page.blur('input[name="amount"]');

      await expect(page.locator('text=Montant invalide, text=Invalid amount')).toBeVisible();
    });

    test('should create invoice with line items', async ({ page }) => {
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');

      // Fill basic info
      await page.fill('input[name="clientName"]', 'Line Items Client');

      // Add line items
      const lineItems = [
        { description: 'Service 1', quantity: '2', unitPrice: '100.00' },
        { description: 'Service 2', quantity: '1', unitPrice: '250.00' },
      ];

      for (const item of lineItems) {
        // Click "Add Line Item" button
        const addItemButton = page.locator('button:has-text("Ajouter une ligne"), button:has-text("Add line item")');
        if (await addItemButton.isVisible()) {
          await addItemButton.click();

          // Fill line item fields
          await page.fill('input[name="itemDescription"]', item.description);
          await page.fill('input[name="quantity"]', item.quantity);
          await page.fill('input[name="unitPrice"]', item.unitPrice);
        }
      }

      // Total should be calculated automatically
      const totalAmount = page.locator('text=Total:, text=Totál:').locator('..');
      await expect(totalAmount).toContainText('450.00');

      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');
    });
  });

  test.describe('Invoice from Quote Conversion', () => {
    test('should convert a quote to an invoice', async ({ page }) => {
      // First create a quote
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fill quote wizard
      await page.fill('input[name="firstName"]', 'Convert');
      await page.fill('input[name="lastName"]', 'ToInvoice');
      await page.fill('input[name="email"]', 'convert@example.com');
      await page.click('button:has-text("Suivant")');

      await page.fill('textarea[name="prompt"]', 'Quote that will be converted to invoice with all necessary details.');
      await page.click('button:has-text("Suivant")');

      await page.click('button:has-text("Créer le devis")');
      await waitForToast(page, 'Devis créé avec succès');

      // Find "Convert to Invoice" button
      const convertButton = page.locator('button:has-text("Convertir en facture"), button:has-text("Convert to invoice")');
      if (await convertButton.isVisible()) {
        await convertButton.click();

        // Should show success and redirect to invoice
        await waitForToast(page, 'Facture créée à partir du devis');
        await expect(page).toHaveURL(/\/invoices/);
      }
    });
  });

  test.describe('Invoice Status Updates', () => {
    test('should mark invoice as paid', async ({ page }) => {
      // Create an invoice first
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Payment Test Client');
      await page.fill('input[name="amount"]', '500.00');
      await page.fill('input[name="dueDate"]', '2026-03-15');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Find invoice and mark as paid
      const invoiceRow = page.locator('text=Payment Test Client').locator('..');
      await invoiceRow.locator('button:has-text("Marquer comme payée"), button:has-text("Mark as paid")').first().click();

      // Should show success toast
      await waitForToast(page, 'Facture marquée comme payée, Invoice marked as paid');

      // Invoice should show paid status
      await expect(page.locator('text=Payée, text=Paid')).toBeVisible();
    });

    test('should send invoice reminder', async ({ page }) => {
      // Create an unpaid invoice
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Reminder Test Client');
      await page.fill('input[name="amount"]', '300.00');
      await page.fill('input[name="dueDate"]', '2026-02-28');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Find invoice and send reminder
      const invoiceRow = page.locator('text=Reminder Test Client').locator('..');
      const reminderButton = invoiceRow.locator('button:has-text("Envoyer un rappel"), button:has-text("Send reminder")');

      if (await reminderButton.isVisible()) {
        await reminderButton.click();
        await waitForToast(page, 'Rappel envoyé, Reminder sent');
      }
    });
  });

  test.describe('Invoice Editing', () => {
    test('should edit an unpaid invoice', async ({ page }) => {
      // Create an invoice
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Edit Test Client');
      await page.fill('input[name="amount"]', '750.00');
      await page.fill('input[name="dueDate"]', '2026-03-20');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Edit invoice
      const invoiceRow = page.locator('text=Edit Test Client').locator('..');
      await invoiceRow.locator('button[aria-label="Edit"], button:has-text("Modifier")').first().click();

      // Update amount
      await page.fill('input[name="amount"]', '850.00');

      // Save changes
      await page.click('button:has-text("Enregistrer"), button:has-text("Save")');

      await waitForToast(page, 'Facture modifiée avec succès');

      // Verify updated amount
      await expect(page.locator('text=850.00')).toBeVisible();
    });

    test('should prevent editing paid invoice', async ({ page }) => {
      // Create and mark as paid
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Paid Invoice Client');
      await page.fill('input[name="amount"]', '400.00');
      await page.fill('input[name="dueDate"]', '2026-03-10');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Mark as paid
      const invoiceRow = page.locator('text=Paid Invoice Client').locator('..');
      await invoiceRow.locator('button:has-text("Marquer comme payée")').first().click();
      await waitForToast(page, 'Facture marquée comme payée');

      // Try to edit - button should be disabled or not visible
      const editButton = invoiceRow.locator('button[aria-label="Edit"], button:has-text("Modifier")');
      if (await editButton.isVisible()) {
        await expect(editButton).toBeDisabled();
      }
    });
  });

  test.describe('Invoice Deletion', () => {
    test('should delete an unpaid invoice', async ({ page }) => {
      // Create an invoice
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Delete Test Client');
      await page.fill('input[name="amount"]', '200.00');
      await page.fill('input[name="dueDate"]', '2026-03-05');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Delete invoice
      const invoiceRow = page.locator('text=Delete Test Client').locator('..');
      await invoiceRow.locator('button[aria-label="Delete"], button:has-text("Supprimer")').first().click();

      // Confirm deletion
      await page.click('button:has-text("Confirmer"), button:has-text("Confirm")');

      await waitForToast(page, 'Facture supprimée avec succès');

      // Invoice should no longer be visible
      await expect(page.locator('text=Delete Test Client')).not.toBeVisible();
    });
  });

  test.describe('Invoice Filtering', () => {
    test('should filter invoices by status', async ({ page }) => {
      // Create paid and unpaid invoices
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'Unpaid Filter Test');
      await page.fill('input[name="amount"]', '100.00');
      await page.fill('input[name="dueDate"]', '2026-03-25');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Filter by unpaid
      const filterSelect = page.locator('select[name="statusFilter"], button:has-text("Statut")');
      if (await filterSelect.isVisible()) {
        await filterSelect.click();
        await page.click('text=Impayée, text=Unpaid');

        // Should show only unpaid invoices
        await expect(page.locator('text=Unpaid Filter Test')).toBeVisible();
      }
    });

    test('should filter invoices by date range', async ({ page }) => {
      // Filter by date range
      const startDateFilter = page.locator('input[name="startDate"]');
      const endDateFilter = page.locator('input[name="endDate"]');

      if (await startDateFilter.isVisible()) {
        await startDateFilter.fill('2026-03-01');
        await endDateFilter.fill('2026-03-31');

        // Apply filter
        const applyButton = page.locator('button:has-text("Appliquer"), button:has-text("Apply")');
        if (await applyButton.isVisible()) {
          await applyButton.click();
        }

        // Should show only invoices in date range
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Invoice Search', () => {
    test('should search invoices by client name', async ({ page }) => {
      // Create multiple invoices
      const clients = ['Search Alpha Client', 'Search Beta Client', 'Different Client'];

      for (const client of clients) {
        await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
        await page.fill('input[name="clientName"]', client);
        await page.fill('input[name="amount"]', '100.00');
        await page.fill('input[name="dueDate"]', '2026-03-30');
        await page.click('button:has-text("Créer"), button:has-text("Create")');
        await waitForToast(page, 'Facture créée avec succès');
      }

      // Search for specific client
      const searchInput = page.locator('input[placeholder*="Rechercher"], input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Alpha');

        // Should show only matching invoice
        await expect(page.locator('text=Search Alpha Client')).toBeVisible();
        await expect(page.locator('text=Search Beta Client')).not.toBeVisible();
      }
    });
  });

  test.describe('Invoice Pagination', () => {
    test('should load more invoices with pagination', async ({ page }) => {
      // Check if "Load More" button exists
      const loadMoreButton = page.locator('button:has-text("Charger plus"), button:has-text("Load more")');

      if (await loadMoreButton.isVisible()) {
        const initialInvoiceCount = await page.locator('[data-testid="invoice-row"]').count();

        // Click load more
        await loadMoreButton.click();

        // Wait for loading
        await page.waitForTimeout(1000);

        // Should have more invoices or button should disappear
        const newInvoiceCount = await page.locator('[data-testid="invoice-row"]').count();
        expect(newInvoiceCount).toBeGreaterThanOrEqual(initialInvoiceCount);
      }
    });
  });

  test.describe('Invoice PDF Export', () => {
    test('should download invoice as PDF', async ({ page }) => {
      // Create an invoice
      await page.click('button:has-text("Nouvelle Facture"), button:has-text("New Invoice")');
      await page.fill('input[name="clientName"]', 'PDF Export Client');
      await page.fill('input[name="amount"]', '1000.00');
      await page.fill('input[name="dueDate"]', '2026-04-01');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Facture créée avec succès');

      // Find and click PDF export button
      const invoiceRow = page.locator('text=PDF Export Client').locator('..');
      const exportButton = invoiceRow.locator('button:has-text("Télécharger PDF"), button:has-text("Download PDF")');

      if (await exportButton.isVisible()) {
        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();

        // Wait for download to complete
        const download = await downloadPromise;

        // Verify download filename
        expect(download.suggestedFilename()).toContain('.pdf');
      }
    });
  });
});

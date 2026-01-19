/**
 * Quotes E2E Tests
 * Tests for quote creation wizard (3-step flow) and management
 */

import { test, expect } from '@playwright/test';
import { generateTestData, login, waitForToast } from './helpers/test-helpers';

test.describe('Quotes Management', () => {
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
  });

  test.describe('Quote Wizard - 3 Step Flow', () => {
    test('should complete full quote creation wizard', async ({ page }) => {
      // Navigate to dashboard and click "Nouveau Devis"
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Wait for wizard modal to open
      await expect(page.locator('text=Nouveau Devis')).toBeVisible();

      // ===== STEP 1: Client Information =====
      await expect(page.locator('text=Informations Client, text=Client Information')).toBeVisible();

      const clientData = {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@example.com',
        phone: '+33612345690',
        company: 'Garage Durand',
        address: '456 Avenue des Champs, 75008 Paris',
      };

      await page.fill('input[name="firstName"]', clientData.firstName);
      await page.fill('input[name="lastName"]', clientData.lastName);
      await page.fill('input[name="email"]', clientData.email);
      await page.fill('input[name="phone"]', clientData.phone);
      await page.fill('input[name="company"]', clientData.company);
      await page.fill('textarea[name="address"]', clientData.address);

      // Click "Suivant" to go to step 2
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // ===== STEP 2: Quote Request Details =====
      await expect(page.locator('text=Demande de Devis, text=Quote Request')).toBeVisible();

      const quoteData = {
        prompt: 'Réparation complète du système de freinage avec remplacement des disques et plaquettes avant et arrière.',
        urgency: 'urgent',
        estimatedBudget: '1500',
      };

      await page.fill('textarea[name="prompt"]', quoteData.prompt);

      // Select urgency
      await page.click('button[role="combobox"]'); // Open urgency dropdown
      await page.click('text=Urgent');

      await page.fill('input[name="estimatedBudget"]', quoteData.estimatedBudget);

      // Click "Suivant" to go to step 3
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // ===== STEP 3: Confirmation =====
      await expect(page.locator('text=Confirmation')).toBeVisible();

      // Verify summary shows entered data
      await expect(page.locator(`text=${clientData.firstName} ${clientData.lastName}`)).toBeVisible();
      await expect(page.locator(`text=${clientData.email}`)).toBeVisible();
      await expect(page.locator(`text=${quoteData.prompt}`)).toBeVisible();

      // Submit quote
      await page.click('button:has-text("Créer le devis"), button:has-text("Create quote")');

      // Should show success toast
      await waitForToast(page, 'Devis créé avec succès');

      // Should redirect to quote detail page or quotes list
      await expect(page).toHaveURL(/\/(quotes|dashboard)/);
    });

    test('should validate step 1 required fields', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Try to proceed without filling required fields
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // Should show validation errors and stay on step 1
      await expect(page.locator('text=Prénom requis, text=First name required')).toBeVisible();
      await expect(page.locator('text=Nom requis, text=Last name required')).toBeVisible();
      await expect(page.locator('text=Email requis, text=Email required')).toBeVisible();
      await expect(page.locator('text=Informations Client')).toBeVisible();
    });

    test('should validate step 2 prompt length', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fill step 1
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // Try short prompt
      await page.fill('textarea[name="prompt"]', 'Too short');
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // Should show validation error
      await expect(page.locator('text=trop courte, text=too short')).toBeVisible();
      await expect(page.locator('text=Demande de Devis')).toBeVisible();
    });

    test('should allow navigation back through wizard steps', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fill step 1
      await page.fill('input[name="firstName"]', 'Back');
      await page.fill('input[name="lastName"]', 'Navigation');
      await page.fill('input[name="email"]', 'back@example.com');
      await page.click('button:has-text("Suivant"), button:has-text("Next")');

      // Now on step 2
      await expect(page.locator('text=Demande de Devis')).toBeVisible();

      // Click "Précédent" to go back
      await page.click('button:has-text("Précédent"), button:has-text("Previous")');

      // Should be back on step 1 with data preserved
      await expect(page.locator('text=Informations Client')).toBeVisible();
      await expect(page.locator('input[name="firstName"]')).toHaveValue('Back');
      await expect(page.locator('input[name="lastName"]')).toHaveValue('Navigation');
    });

    test('should close wizard and clear data on cancel', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fill some data
      await page.fill('input[name="firstName"]', 'Cancel');
      await page.fill('input[name="lastName"]', 'Test');

      // Click cancel/close
      await page.click('button[aria-label="Close"], button:has-text("Annuler"), button:has-text("Cancel")');

      // Modal should close
      await expect(page.locator('text=Nouveau Devis')).not.toBeVisible();

      // Reopen modal
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fields should be cleared
      await expect(page.locator('input[name="firstName"]')).toHaveValue('');
      await expect(page.locator('input[name="lastName"]')).toHaveValue('');
    });
  });

  test.describe('Quotes List', () => {
    test('should display created quotes in list', async ({ page }) => {
      // Create a quote first
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      // Fill wizard
      await page.fill('input[name="firstName"]', 'List');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="email"]', 'list@example.com');
      await page.click('button:has-text("Suivant")');

      await page.fill('textarea[name="prompt"]', 'This is a test quote for the list view with sufficient length to pass validation.');
      await page.click('button:has-text("Suivant")');

      await page.click('button:has-text("Créer le devis")');
      await waitForToast(page, 'Devis créé avec succès');

      // Navigate to quotes page
      await page.click('a[href="/quotes"]');
      await expect(page).toHaveURL('/quotes');

      // Quote should appear in list
      await expect(page.locator('text=List Test')).toBeVisible();
    });

    test('should load more quotes with pagination', async ({ page }) => {
      // Navigate to quotes page
      await page.goto('/quotes');

      // Check if "Load More" button exists
      const loadMoreButton = page.locator('button:has-text("Charger plus"), button:has-text("Load more")');

      if (await loadMoreButton.isVisible()) {
        const initialQuoteCount = await page.locator('[data-testid="quote-row"]').count();

        // Click load more
        await loadMoreButton.click();

        // Wait for loading
        await page.waitForTimeout(1000);

        // Should have more quotes
        const newQuoteCount = await page.locator('[data-testid="quote-row"]').count();
        expect(newQuoteCount).toBeGreaterThan(initialQuoteCount);
      }
    });
  });

  test.describe('Quote Details', () => {
    test('should view quote details', async ({ page }) => {
      // Create a quote
      await page.goto('/dashboard');
      await page.click('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      await page.fill('input[name="firstName"]', 'Details');
      await page.fill('input[name="lastName"]', 'View');
      await page.fill('input[name="email"]', 'details@example.com');
      await page.click('button:has-text("Suivant")');

      const quotePrompt = 'Detailed quote description for testing the detail view functionality.';
      await page.fill('textarea[name="prompt"]', quotePrompt);
      await page.click('button:has-text("Suivant")');

      await page.click('button:has-text("Créer le devis")');
      await waitForToast(page, 'Devis créé avec succès');

      // Should be on quote detail page or navigate to it
      // Verify quote details are displayed
      await expect(page.locator('text=Details View')).toBeVisible();
      await expect(page.locator(`text=${quotePrompt}`)).toBeVisible();
    });
  });
});

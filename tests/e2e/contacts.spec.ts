/**
 * Contacts E2E Tests
 * Tests for contact creation, editing, and management
 */

import { test, expect } from '@playwright/test';
import { generateTestData, login, waitForToast } from './helpers/test-helpers';

test.describe('Contacts Management', () => {
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

    // Navigate to contacts page
    await page.click('a[href="/contacts"]');
    await expect(page).toHaveURL('/contacts');
  });

  test.describe('Contact Creation', () => {
    test('should create a new contact with minimal required fields', async ({ page }) => {
      // Click "Nouveau Contact" button
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');

      // Wait for modal to open
      await expect(page.locator('text=Informations du contact')).toBeVisible();

      // Fill required fields
      const contactData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678',
      };

      await page.fill('input[name="firstName"]', contactData.firstName);
      await page.fill('input[name="lastName"]', contactData.lastName);
      await page.fill('input[name="email"]', contactData.email);
      await page.fill('input[name="phone"]', contactData.phone);

      // Submit
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');

      // Should show success toast
      await waitForToast(page, 'Contact créé avec succès');

      // Modal should close
      await expect(page.locator('text=Informations du contact')).not.toBeVisible();

      // Contact should appear in list
      await expect(page.locator(`text=${contactData.firstName} ${contactData.lastName}`)).toBeVisible();
    });

    test('should create a contact with all fields filled', async ({ page }) => {
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');

      const contactData = {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        phone: '+33612345679',
        company: 'Acme Corp',
        address: '123 Rue de la Paix, 75001 Paris',
      };

      // Fill all fields
      await page.fill('input[name="firstName"]', contactData.firstName);
      await page.fill('input[name="lastName"]', contactData.lastName);
      await page.fill('input[name="email"]', contactData.email);
      await page.fill('input[name="phone"]', contactData.phone);
      await page.fill('input[name="company"]', contactData.company);
      await page.fill('textarea[name="address"]', contactData.address);

      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');

      await waitForToast(page, 'Contact créé avec succès');

      // Verify contact appears with company name
      await expect(page.locator(`text=${contactData.company}`)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');

      // Try to submit without filling required fields
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');

      // Should show validation errors
      await expect(page.locator('text=Prénom requis, text=First name required')).toBeVisible();
      await expect(page.locator('text=Nom requis, text=Last name required')).toBeVisible();
      await expect(page.locator('text=Email requis, text=Email required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.blur('input[name="email"]');

      await expect(page.locator('text=Email invalide, text=Invalid email')).toBeVisible();
    });

    test('should prevent duplicate contact creation', async ({ page }) => {
      const contactData = {
        firstName: 'Duplicate',
        lastName: 'Test',
        email: 'duplicate@example.com',
        phone: '+33612345680',
      };

      // Create first contact
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');
      await page.fill('input[name="firstName"]', contactData.firstName);
      await page.fill('input[name="lastName"]', contactData.lastName);
      await page.fill('input[name="email"]', contactData.email);
      await page.fill('input[name="phone"]', contactData.phone);
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');
      await waitForToast(page, 'Contact créé avec succès');

      // Try to create duplicate
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');
      await page.fill('input[name="firstName"]', contactData.firstName);
      await page.fill('input[name="lastName"]', contactData.lastName);
      await page.fill('input[name="email"]', contactData.email);
      await page.fill('input[name="phone"]', contactData.phone);
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');

      // Should show error
      await waitForToast(page, 'existe déjà');
    });
  });

  test.describe('Contact Editing', () => {
    test('should edit an existing contact', async ({ page }) => {
      // Create a contact first
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');
      await page.fill('input[name="firstName"]', 'Original');
      await page.fill('input[name="lastName"]', 'Name');
      await page.fill('input[name="email"]', 'original@example.com');
      await page.fill('input[name="phone"]', '+33612345681');
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');
      await waitForToast(page, 'Contact créé avec succès');

      // Find and click edit button for this contact
      const contactRow = page.locator('text=Original Name').locator('..');
      await contactRow.locator('button[aria-label="Edit"], button:has-text("Edit")').first().click();

      // Wait for edit modal
      await expect(page.locator('text=Modifier le contact, text=Edit contact')).toBeVisible();

      // Update fields
      await page.fill('input[name="firstName"]', 'Updated');
      await page.fill('input[name="company"]', 'New Company');

      // Save changes
      await page.click('button:has-text("Enregistrer"), button:has-text("Save")');

      await waitForToast(page, 'Contact modifié avec succès');

      // Verify changes
      await expect(page.locator('text=Updated Name')).toBeVisible();
      await expect(page.locator('text=New Company')).toBeVisible();
    });
  });

  test.describe('Contact Deletion', () => {
    test('should delete a contact', async ({ page }) => {
      // Create a contact to delete
      await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');
      await page.fill('input[name="firstName"]', 'ToDelete');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'todelete@example.com');
      await page.fill('input[name="phone"]', '+33612345682');
      await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');
      await waitForToast(page, 'Contact créé avec succès');

      // Find and click delete button
      const contactRow = page.locator('text=ToDelete User').locator('..');
      await contactRow.locator('button[aria-label="Delete"], button:has-text("Delete")').first().click();

      // Confirm deletion
      await page.click('button:has-text("Confirmer"), button:has-text("Confirm")');

      await waitForToast(page, 'Contact supprimé avec succès');

      // Contact should no longer be visible
      await expect(page.locator('text=ToDelete User')).not.toBeVisible();
    });
  });

  test.describe('Contact Search', () => {
    test('should search contacts by name', async ({ page }) => {
      // Create multiple contacts
      const contacts = [
        { firstName: 'Alice', lastName: 'Anderson', email: 'alice@example.com', phone: '+33612345683' },
        { firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', phone: '+33612345684' },
        { firstName: 'Charlie', lastName: 'Chen', email: 'charlie@example.com', phone: '+33612345685' },
      ];

      for (const contact of contacts) {
        await page.click('button:has-text("Nouveau Contact"), button:has-text("New Contact")');
        await page.fill('input[name="firstName"]', contact.firstName);
        await page.fill('input[name="lastName"]', contact.lastName);
        await page.fill('input[name="email"]', contact.email);
        await page.fill('input[name="phone"]', contact.phone);
        await page.click('button:has-text("Créer le contact"), button:has-text("Create contact")');
        await waitForToast(page, 'Contact créé avec succès');
      }

      // Search for specific contact
      const searchInput = page.locator('input[placeholder*="Rechercher"], input[placeholder*="Search"]');
      await searchInput.fill('Alice');

      // Should show only Alice
      await expect(page.locator('text=Alice Anderson')).toBeVisible();
      await expect(page.locator('text=Bob Brown')).not.toBeVisible();
      await expect(page.locator('text=Charlie Chen')).not.toBeVisible();
    });
  });
});

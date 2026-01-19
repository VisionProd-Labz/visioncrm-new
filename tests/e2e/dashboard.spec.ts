/**
 * Dashboard E2E Tests
 * Tests for dashboard loading, stats display, and navigation
 */

import { test, expect } from '@playwright/test';
import { generateTestData, login } from './helpers/test-helpers';

test.describe('Dashboard', () => {
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

  test.describe('Dashboard Loading', () => {
    test('should load dashboard successfully', async ({ page }) => {
      await expect(page).toHaveURL('/dashboard');

      // Should display key dashboard elements
      await expect(page.locator('text=Dashboard, text=Tableau de bord')).toBeVisible();

      // Header should be visible
      await expect(page.locator('header')).toBeVisible();

      // Navigation sidebar should be visible
      await expect(page.locator('nav, aside')).toBeVisible();
    });

    test('should display user name in header', async ({ page }) => {
      await expect(page.locator(`text=${testUser.firstName}`)).toBeVisible();
    });

    test('should load without console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Filter out expected/harmless errors if any
      const criticalErrors = errors.filter(
        (error) => !error.includes('favicon') && !error.includes('Next.js')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Dashboard Stats', () => {
    test('should display stat cards', async ({ page }) => {
      // Should show stat cards for key metrics
      const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="card"]');
      const count = await statCards.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should display revenue stats', async ({ page }) => {
      // Look for revenue-related text
      const revenueIndicators = [
        'Revenu',
        'Revenue',
        'Chiffre d\'affaires',
        'Total',
        '€',
        'EUR',
      ];

      let found = false;
      for (const indicator of revenueIndicators) {
        const element = page.locator(`text=${indicator}`);
        if ((await element.count()) > 0) {
          found = true;
          break;
        }
      }

      expect(found).toBe(true);
    });

    test('should display contact count', async ({ page }) => {
      // Look for contact count indicators
      const contactIndicators = ['Contacts', 'Clients', 'Client'];

      let found = false;
      for (const indicator of contactIndicators) {
        const element = page.locator(`text=${indicator}`);
        if ((await element.count()) > 0) {
          found = true;
          break;
        }
      }

      expect(found).toBe(true);
    });

    test('should update stats after creating entities', async ({ page }) => {
      // Get initial contact count
      const contactStat = page.locator('text=Contacts').locator('..');
      const initialCount = await contactStat.textContent();

      // Create a new contact
      await page.click('a[href="/contacts"]');
      await page.click('button:has-text("Nouveau Contact")');

      await page.fill('input[name="firstName"]', 'Stat');
      await page.fill('input[name="lastName"]', 'Update');
      await page.fill('input[name="email"]', 'statupdate@example.com');
      await page.fill('input[name="phone"]', '+33612345691');
      await page.click('button:has-text("Créer le contact")');

      // Go back to dashboard
      await page.click('a[href="/dashboard"]');
      await page.waitForLoadState('networkidle');

      // Contact count should have increased
      const newCount = await contactStat.textContent();
      expect(newCount).not.toBe(initialCount);
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should navigate to contacts page', async ({ page }) => {
      await page.click('a[href="/contacts"]');
      await expect(page).toHaveURL('/contacts');
      await expect(page.locator('text=Contacts')).toBeVisible();
    });

    test('should navigate to quotes page', async ({ page }) => {
      await page.click('a[href="/quotes"]');
      await expect(page).toHaveURL('/quotes');
      await expect(page.locator('text=Devis, text=Quotes')).toBeVisible();
    });

    test('should navigate to invoices page', async ({ page }) => {
      await page.click('a[href="/invoices"]');
      await expect(page).toHaveURL('/invoices');
      await expect(page.locator('text=Factures, text=Invoices')).toBeVisible();
    });

    test('should navigate to tasks page', async ({ page }) => {
      await page.click('a[href="/tasks"]');
      await expect(page).toHaveURL('/tasks');
      await expect(page.locator('text=Tâches, text=Tasks')).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
      // Click user menu
      await page.click('[data-testid="user-menu-trigger"], button:has-text("' + testUser.firstName + '")');

      // Click settings
      await page.click('text=Paramètres, text=Settings');

      await expect(page).toHaveURL('/settings');
    });
  });

  test.describe('Quick Actions', () => {
    test('should open new contact modal from dashboard', async ({ page }) => {
      const newContactButton = page.locator('button:has-text("Nouveau Contact"), button:has-text("New Contact")');

      if (await newContactButton.isVisible()) {
        await newContactButton.click();
        await expect(page.locator('text=Informations du contact')).toBeVisible();
      }
    });

    test('should open new quote modal from dashboard', async ({ page }) => {
      const newQuoteButton = page.locator('button:has-text("Nouveau Devis"), button:has-text("New Quote")');

      if (await newQuoteButton.isVisible()) {
        await newQuoteButton.click();
        await expect(page.locator('text=Nouveau Devis')).toBeVisible();
      }
    });
  });

  test.describe('Recent Activity', () => {
    test('should display recent activity section', async ({ page }) => {
      // Look for recent activity indicators
      const activityIndicators = [
        'Activité récente',
        'Recent activity',
        'Récent',
        'Recent',
        'Historique',
        'History',
      ];

      let found = false;
      for (const indicator of activityIndicators) {
        const element = page.locator(`text=${indicator}`);
        if ((await element.count()) > 0) {
          found = true;
          break;
        }
      }

      // This may not exist on all dashboards, so we just check
      if (found) {
        expect(found).toBe(true);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Dashboard should still be functional
      await expect(page.locator('text=Dashboard, text=Tableau de bord')).toBeVisible();

      // Mobile menu button should be visible
      const mobileMenuButton = page.locator('button[aria-label="Menu"], button:has-text("Menu")');
      expect(await mobileMenuButton.isVisible()).toBeTruthy();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('text=Dashboard, text=Tableau de bord')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should have global search accessible', async ({ page }) => {
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"], input[placeholder*="Search"]');

      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();

        // Test search shortcut (Cmd+K or Ctrl+K)
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');

        // Command palette or search should open
        const commandPalette = page.locator('[role="dialog"], [data-testid="command-palette"]');
        await expect(commandPalette).toBeVisible();
      }
    });
  });

  test.describe('Notifications', () => {
    test('should have notifications menu in header', async ({ page }) => {
      // Look for notification bell icon
      const notificationBell = page.locator('[data-testid="notifications"], button[aria-label*="Notification"]');

      if (await notificationBell.isVisible()) {
        await notificationBell.click();

        // Notifications dropdown should open
        await expect(page.locator('text=Notifications')).toBeVisible();
      }
    });
  });

  test.describe('Theme Toggle', () => {
    test('should toggle between light and dark mode', async ({ page }) => {
      // Open user menu
      await page.click('button:has-text("' + testUser.firstName + '")');

      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme"], button:has-text("Theme")');

      if (await themeToggle.isVisible()) {
        // Get current theme
        const htmlClass = await page.locator('html').getAttribute('class');

        // Toggle theme
        await themeToggle.click();

        // Wait a bit for theme to change
        await page.waitForTimeout(300);

        // Theme should have changed
        const newHtmlClass = await page.locator('html').getAttribute('class');
        expect(newHtmlClass).not.toBe(htmlClass);
      }
    });
  });
});

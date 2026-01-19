/**
 * Authentication E2E Tests
 * Tests for login, registration, and logout flows
 */

import { test, expect } from '@playwright/test';
import {
  generateTestData,
  login,
  register,
  logout,
  waitForToast,
  fillFieldValid,
  expectFieldError,
} from './helpers/test-helpers';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should successfully register a new user', async ({ page }) => {
      const testData = generateTestData();

      await register(page, testData);

      // Should show success toast
      await waitForToast(page, 'Compte créé avec succès');

      // Should remain on register page (or redirect to login based on implementation)
      // Verify success message or redirect
      await expect(page).toHaveURL(/\/(register|login)/);
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/register');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expectFieldError(page, 'input[name="firstName"]', 'Prénom requis');
      await expectFieldError(page, 'input[name="lastName"]', 'Nom requis');
      await expectFieldError(page, 'input[name="email"]', 'Email requis');
      await expectFieldError(page, 'input[name="password"]');
      await expectFieldError(page, 'input[name="companyName"]', 'Nom du garage requis');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');

      // Enter invalid email
      await page.fill('input[name="email"]', 'invalid-email');
      await expectFieldError(page, 'input[name="email"]', 'Email invalide');

      // Enter valid email
      await fillFieldValid(page, 'input[name="email"]', 'valid@example.com');
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');

      // Too short
      await page.fill('input[name="password"]', 'short');
      await expectFieldError(page, 'input[name="password"]', 'trop court');

      // No uppercase
      await page.fill('input[name="password"]', 'nouppercase123!');
      await expectFieldError(page, 'input[name="password"]', 'majuscule');

      // No lowercase
      await page.fill('input[name="password"]', 'NOLOWERCASE123!');
      await expectFieldError(page, 'input[name="password"]', 'minuscule');

      // No number
      await page.fill('input[name="password"]', 'NoNumberHere!');
      await expectFieldError(page, 'input[name="password"]', 'chiffre');

      // No special character
      await page.fill('input[name="password"]', 'NoSpecialChar123');
      await expectFieldError(page, 'input[name="password"]', 'caractère spécial');

      // Valid password
      await fillFieldValid(page, 'input[name="password"]', 'ValidPassword123!');
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      const testData = generateTestData();

      // Register first time
      await register(page, testData);
      await waitForToast(page, 'Compte créé avec succès');

      // Try to register again with same email
      await register(page, testData);

      // Should show error
      await waitForToast(page, 'existe déjà');
    });
  });

  test.describe('Login', () => {
    let testUser: ReturnType<typeof generateTestData>;

    test.beforeAll(async ({ browser }) => {
      // Create a test user before login tests
      testUser = generateTestData();
      const page = await browser.newPage();
      await register(page, testUser);
      await waitForToast(page, 'Compte créé avec succès');
      await page.close();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await login(page, testUser.email, testUser.password);

      // Should be on dashboard
      await expect(page).toHaveURL('/dashboard');

      // Should see user name in header
      await expect(page.locator('text=' + testUser.firstName)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Should show error message
      await waitForToast(page, 'Invalid credentials');
    });

    test('should validate email format on login', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'invalid-email');
      await expectFieldError(page, 'input[name="email"]', 'Email invalide');
    });

    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 10000 });
      await expect(page).toHaveURL('/login');
    });

    test('should persist session after page reload', async ({ page }) => {
      // Login
      await login(page, testUser.email, testUser.password);
      await expect(page).toHaveURL('/dashboard');

      // Reload page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=' + testUser.firstName)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    let testUser: ReturnType<typeof generateTestData>;

    test.beforeEach(async ({ browser }) => {
      // Create and login a test user before each test
      testUser = generateTestData();
      const page = await browser.newPage();
      await register(page, testUser);
      await page.close();
    });

    test('should successfully logout', async ({ page }) => {
      // Login first
      await login(page, testUser.email, testUser.password);
      await expect(page).toHaveURL('/dashboard');

      // Logout
      await logout(page);

      // Should be on login page
      await expect(page).toHaveURL('/login');

      // Trying to access dashboard should redirect to login
      await page.goto('/dashboard');
      await page.waitForURL('/login', { timeout: 10000 });
      await expect(page).toHaveURL('/login');
    });

    test('should clear session data on logout', async ({ page }) => {
      // Login
      await login(page, testUser.email, testUser.password);

      // Logout
      await logout(page);

      // Go back to dashboard - should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
    });
  });
});

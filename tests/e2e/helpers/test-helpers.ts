/**
 * Playwright Test Helpers
 * Shared utilities for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Generate unique test data with timestamp
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    firstName: `Test-${timestamp}`,
    lastName: `User-${timestamp}`,
    companyName: `Test Company ${timestamp}`,
    password: 'TestPassword123!@#',
  };
}

/**
 * Fill and submit login form
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Fill and submit registration form
 */
export async function register(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
  }
) {
  await page.goto('/register');

  await page.fill('input[name="firstName"]', data.firstName);
  await page.fill('input[name="lastName"]', data.lastName);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="companyName"]', data.companyName);

  await page.click('button[type="submit"]');
}

/**
 * Logout from application
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu-trigger"], button:has-text("User")');

  // Click logout
  await page.click('text=Déconnexion');

  // Wait for redirect to login
  await page.waitForURL('/login', { timeout: 10000 });
  await expect(page).toHaveURL('/login');
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.locator(`[role="status"]:has-text("${message}")`);
  await expect(toast).toBeVisible({ timeout });
}

/**
 * Clear test data (contacts, quotes, etc.)
 * This would call API endpoints to clean up test data
 */
export async function cleanupTestData(page: Page, testEmail: string) {
  // TODO: Implement API calls to delete test data
  // For now, this is a placeholder
  console.log(`Cleanup test data for: ${testEmail}`);
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `playwright-report/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Check if element is visible and has text
 */
export async function expectTextVisible(page: Page, text: string) {
  const element = page.locator(`text=${text}`);
  await expect(element).toBeVisible();
}

/**
 * Fill form field and verify no validation errors
 */
export async function fillFieldValid(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
  await page.locator(selector).blur();

  // Wait a bit for validation to run
  await page.waitForTimeout(300);

  // Check no error message appears near this field
  const fieldContainer = page.locator(selector).locator('..');
  const errorMessage = fieldContainer.locator('.text-destructive, .text-red-500, .text-red-600');
  await expect(errorMessage).toHaveCount(0);
}

/**
 * Expect validation error for a field
 */
export async function expectFieldError(page: Page, selector: string, errorText?: string) {
  await page.locator(selector).blur();
  await page.waitForTimeout(300);

  const fieldContainer = page.locator(selector).locator('..');
  const errorMessage = fieldContainer.locator('.text-destructive, .text-red-500, .text-red-600');

  await expect(errorMessage).toBeVisible();

  if (errorText) {
    await expect(errorMessage).toContainText(errorText);
  }
}

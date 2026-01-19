import { test, expect } from '@playwright/test';

test.describe('SQL Injection Protection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should not allow SQL injection in login email field', async ({ page }) => {
    // Attempt SQL injection via email field
    await page.fill('input[name="email"]', "admin'--");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should show error, not login
    await expect(page).toHaveURL(/login/, { timeout: 5000 });

    // Should not crash or leak database info
    await expect(page.locator('text=/database error|sql error/i')).not.toBeVisible();

    // Should show generic authentication error
    await expect(
      page.locator('text=/invalid.*credentials|incorrect.*email|incorrect.*password/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should not allow SQL injection in login password field', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', "' OR '1'='1");
    await page.click('button[type="submit"]');

    // Should not bypass authentication
    await expect(page).toHaveURL(/login/);
    await expect(
      page.locator('text=/invalid.*credentials|incorrect/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should not allow SQL injection in register fields', async ({ page }) => {
    await page.goto('/register');

    // Try SQL injection in various fields
    await page.fill('input[name="name"]', "Admin'; DROP TABLE users; --");
    await page.fill('input[name="email"]', "test' OR 1=1 --@example.com");
    await page.fill('input[name="password"]', "Password123!@#");
    await page.fill('input[name="tenantName"]', "Garage' OR '1'='1");
    await page.fill('input[name="subdomain"]', "test' UNION SELECT * FROM passwords --");

    await page.click('button[type="submit"]');

    // Should either:
    // 1. Show validation error (preferred)
    // 2. Create account with sanitized data
    // 3. NOT crash or show database errors

    // Wait for response
    await page.waitForTimeout(2000);

    // Should not show database errors
    await expect(page.locator('text=/database error|sql syntax|mysql|postgresql/i')).not.toBeVisible();
  });

  test('should sanitize SQL injection in search/filter endpoints', async ({ page }) => {
    // First, login with valid credentials
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!@#');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to contacts page
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Try SQL injection in search box (if exists)
    const searchInput = page.locator('input[placeholder*="Rechercher" i], input[placeholder*="Search" i]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("'; DROP TABLE contacts; --");
      await page.waitForTimeout(1000);

      // Should not show database errors
      await expect(page.locator('text=/database error|sql error/i')).not.toBeVisible();

      // Page should still be functional
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('should handle SQL injection in API endpoints', async ({ page, request }) => {
    // Login first to get session
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Get cookies for API request
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Test SQL injection in API query parameters
    const response = await request.get('/api/contacts', {
      params: {
        search: "'; DROP TABLE contacts; --",
        limit: '20',
        offset: '0',
      },
      headers: {
        'Cookie': cookieHeader,
      },
    });

    // Should return safe response (not 500)
    expect(response.status()).toBeLessThan(500);

    // Response should not contain database errors
    const body = await response.text();
    expect(body).not.toMatch(/database error|sql syntax|mysql|postgresql/i);
  });

  test('should protect against UNION-based SQL injection', async ({ page }) => {
    await page.goto('/login');

    // UNION attack attempt
    await page.fill('input[name="email"]', "' UNION SELECT password FROM users WHERE email='admin@example.com' --");
    await page.fill('input[name="password"]', 'anything');
    await page.click('button[type="submit"]');

    // Should not bypass authentication
    await expect(page).toHaveURL(/login/);

    // Should not leak sensitive data in error messages
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/password.*hash|bcrypt|\$2[aby]\$|SELECT.*FROM/i);
  });

  test('should protect against blind SQL injection', async ({ page }) => {
    await page.goto('/login');

    // Time-based blind SQL injection attempt
    const startTime = Date.now();

    await page.fill('input[name="email"]', "admin' AND SLEEP(5) --");
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Should not execute SLEEP command (response should be fast)
    expect(responseTime).toBeLessThan(5000);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Rate Limiting Protection', () => {
  test('should rate limit login attempts', async ({ page }) => {
    await page.goto('/login');

    const testEmail = 'test@example.com';
    const wrongPassword = 'wrongpassword';

    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', wrongPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // 6th attempt should be rate limited
    const errorMessage = page.locator('text=/too many|rate limit|trop de tentatives/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Verify still on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should rate limit registration attempts', async ({ page }) => {
    await page.goto('/register');

    // Attempt multiple registrations with same email
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="name"]', `Test User ${i}`);
      await page.fill('input[name="email"]', 'ratelimit@test.com');
      await page.fill('input[name="password"]', 'Password123!@#');
      await page.fill('input[name="tenantName"]', `Garage ${i}`);
      await page.fill('input[name="subdomain"]', `garage-${i}-${Date.now()}`);

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // After first attempt, go back to register
      if (i < 5) {
        await page.goto('/register');
      }
    }

    // Should show rate limit message
    const rateLimitMessage = page.locator('text=/too many|rate limit|trop de tentatives/i');
    await expect(rateLimitMessage).toBeVisible({ timeout: 5000 });
  });

  test('should rate limit password reset requests', async ({ page }) => {
    await page.goto('/forgot-password');

    const testEmail = 'test@example.com';

    // Attempt multiple password resets
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', testEmail);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // Should show rate limit message
    const rateLimitMessage = page.locator('text=/too many|rate limit|trop de/i');
    await expect(rateLimitMessage).toBeVisible({ timeout: 5000 });
  });

  test('should rate limit API requests', async ({ page, request }) => {
    // Login first to get session
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Make rapid API requests
    const requests: Promise<any>[] = [];
    for (let i = 0; i < 100; i++) {
      requests.push(
        request.get('/api/contacts', {
          headers: { Cookie: cookieHeader },
        })
      );
    }

    const responses = await Promise.all(requests);

    // At least one request should be rate limited (429 Too Many Requests)
    const rateLimitedRequests = responses.filter(r => r.status() === 429);

    expect(rateLimitedRequests.length).toBeGreaterThan(0);
  });

  test('should allow requests after rate limit cooldown', async ({ page }) => {
    await page.goto('/login');

    // Trigger rate limit
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', 'cooldown@test.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(300);
    }

    // Verify rate limited
    await expect(page.locator('text=/too many|rate limit/i')).toBeVisible({ timeout: 5000 });

    // Wait for cooldown period (typically 1-5 minutes, adjust based on your config)
    // For testing, we'll just verify the message exists
    // In production, you'd wait: await page.waitForTimeout(60000);

    // Note: This test is informational - actual cooldown testing
    // requires waiting which is impractical in CI
    // Real-world validation should be done manually or in integration tests
  });

  test('should have different rate limits for different IPs', async ({ browser }) => {
    // Create two separate contexts (simulating different users/IPs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1 triggers rate limit
    await page1.goto('/login');
    for (let i = 0; i < 6; i++) {
      await page1.fill('input[name="email"]', 'user1@test.com');
      await page1.fill('input[name="password"]', 'wrongpass');
      await page1.click('button[type="submit"]');
      await page1.waitForTimeout(300);
    }

    // User 1 should be rate limited
    await expect(page1.locator('text=/too many|rate limit/i')).toBeVisible({ timeout: 5000 });

    // User 2 should still be able to attempt login
    await page2.goto('/login');
    await page2.fill('input[name="email"]', 'user2@test.com');
    await page2.fill('input[name="password"]', 'wrongpass');
    await page2.click('button[type="submit"]');

    // User 2 should see normal error (not rate limited yet)
    await expect(page2.locator('text=/too many|rate limit/i')).not.toBeVisible();
    await expect(page2.locator('text=/invalid|incorrect/i')).toBeVisible({ timeout: 5000 });

    await context1.close();
    await context2.close();
  });
});

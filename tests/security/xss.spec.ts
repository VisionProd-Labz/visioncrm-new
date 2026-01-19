import { test, expect } from '@playwright/test';

test.describe('XSS (Cross-Site Scripting) Protection', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should sanitize script tags in contact names', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Click new contact button
    const newContactButton = page.locator('button:has-text("Nouveau"), button:has-text("New")').first();
    await newContactButton.click();

    // Fill form with XSS payloads
    await page.fill('input[name="firstName"], input[name="first_name"]', '<script>alert("XSS")</script>');
    await page.fill('input[name="lastName"], input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'xss-test@example.com');

    // Listen for any alerts (should not happen)
    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    // Submit form
    await page.click('button[type="submit"], button:has-text("Enregistrer"), button:has-text("Save")');

    await page.waitForTimeout(2000);

    // Alert should not have fired
    expect(alertFired).toBe(false);

    // Check that script tag is escaped/sanitized in the DOM
    const contactList = page.locator('body');
    const htmlContent = await contactList.innerHTML();

    // Should not contain executable script
    expect(htmlContent).not.toContain('<script>alert("XSS")</script>');

    // Should contain escaped version or be removed
    // Either &lt;script&gt; or just not present
  });

  test('should sanitize HTML tags in contact company field', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const newContactButton = page.locator('button:has-text("Nouveau"), button:has-text("New")').first();
    await newContactButton.click();

    // XSS via HTML tags
    await page.fill('input[name="firstName"], input[name="first_name"]', 'John');
    await page.fill('input[name="lastName"], input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', 'john.xss@example.com');
    await page.fill('input[name="company"]', '<img src=x onerror=alert("XSS")>');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.click('button[type="submit"], button:has-text("Enregistrer"), button:has-text("Save")');
    await page.waitForTimeout(2000);

    expect(alertFired).toBe(false);

    // Should not render as an actual <img> tag with onerror handler
    const bodyHTML = await page.locator('body').innerHTML();
    expect(bodyHTML).not.toMatch(/<img[^>]*onerror/i);
  });

  test('should sanitize XSS in quote descriptions', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');

    // Click new quote button
    const newQuoteButton = page.locator('button:has-text("Nouveau"), button:has-text("New")').first();
    await newQuoteButton.click();

    // Wait for wizard step 1
    await page.waitForTimeout(1000);

    // Select existing contact or fill new one
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Test');
      await page.locator('input[name="lastName"], input[name="last_name"]').first().fill('User');
      await page.locator('input[name="email"]').first().fill('test@example.com');
    }

    // Next step
    await page.click('button:has-text("Suivant"), button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Fill description with XSS payload
    const descriptionField = page.locator('textarea[name="description"], textarea[name="request"]').first();
    await descriptionField.fill('<script>alert("XSS in quote")</script>');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    // Next step
    await page.click('button:has-text("Suivant"), button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Final step - create quote
    await page.click('button:has-text("Créer"), button:has-text("Create")');
    await page.waitForTimeout(2000);

    expect(alertFired).toBe(false);
  });

  test('should sanitize XSS in task titles', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const newTaskButton = page.locator('button:has-text("Nouveau"), button:has-text("New")').first();
    await newTaskButton.click();

    await page.waitForTimeout(1000);

    // XSS payload in title
    await page.fill('input[name="title"]', '<img src=x onerror=alert("XSS")>');
    await page.fill('textarea[name="description"]', 'Test task description');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.click('button[type="submit"], button:has-text("Créer"), button:has-text("Create")');
    await page.waitForTimeout(2000);

    expect(alertFired).toBe(false);

    // Verify sanitization in task list
    const taskList = await page.locator('body').innerHTML();
    expect(taskList).not.toMatch(/<img[^>]*onerror/i);
  });

  test('should protect against DOM-based XSS via URL parameters', async ({ page }) => {
    // Attempt XSS via URL parameter
    await page.goto('/contacts?search=<script>alert("XSS")</script>');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(alertFired).toBe(false);

    // Check that parameter is not directly rendered in DOM
    const bodyHTML = await page.locator('body').innerHTML();
    expect(bodyHTML).not.toContain('<script>alert("XSS")</script>');
  });

  test('should sanitize JavaScript event handlers', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const newContactButton = page.locator('button:has-text("Nouveau"), button:has-text("New")').first();
    await newContactButton.click();

    // XSS via event handlers
    await page.fill('input[name="firstName"], input[name="first_name"]', '<div onclick="alert(\'XSS\')">Click me</div>');
    await page.fill('input[name="lastName"], input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'event-xss@example.com');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.click('button[type="submit"], button:has-text("Enregistrer"), button:has-text("Save")');
    await page.waitForTimeout(2000);

    expect(alertFired).toBe(false);

    // Should not render with onclick handler
    const bodyHTML = await page.locator('body').innerHTML();
    expect(bodyHTML).not.toMatch(/onclick\s*=\s*["']alert/i);
  });

  test('should protect against reflected XSS in error messages', async ({ page }) => {
    await page.goto('/login');

    // Attempt XSS in email field that might be reflected in error
    await page.fill('input[name="email"]', '<script>alert("XSS")</script>@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    expect(alertFired).toBe(false);

    // Error message should not contain unescaped script
    const bodyHTML = await page.locator('body').innerHTML();
    expect(bodyHTML).not.toContain('<script>alert("XSS")</script>');
  });

  test('should sanitize XSS in JSON responses', async ({ page, request }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Request API endpoint with XSS in parameter
    const response = await request.get('/api/contacts', {
      params: {
        search: '<script>alert("XSS")</script>',
      },
      headers: {
        'Cookie': cookieHeader,
      },
    });

    const body = await response.text();

    // Response should not contain unescaped script tags
    expect(body).not.toContain('<script>alert("XSS")</script>');

    // If present, should be escaped
    if (body.includes('script')) {
      expect(body).toMatch(/&lt;script&gt;|\\u003cscript\\u003e/i);
    }
  });
});

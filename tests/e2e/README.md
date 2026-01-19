# VisionCRM E2E Tests

End-to-end tests for VisionCRM using Playwright.

## Test Coverage

### 1. Authentication (`auth.spec.ts`)
- User registration with validation
- Email format validation
- Password strength validation
- User login/logout flows
- Session persistence
- Protected route access

### 2. Contacts Management (`contacts.spec.ts`)
- Contact creation (minimal and full fields)
- Field validation
- Contact editing
- Contact deletion
- Contact search
- Duplicate prevention

### 3. Quotes Management (`quotes.spec.ts`)
- **3-Step Quote Wizard:**
  - Step 1: Client information
  - Step 2: Quote request details
  - Step 3: Confirmation
- Wizard navigation (back/forward)
- Step validation
- Quote list display
- Quote pagination
- Quote details view

### 4. Invoices Management (`invoices.spec.ts`)
- Invoice creation with line items
- Quote to invoice conversion
- Invoice status updates (mark as paid)
- Invoice reminders
- Invoice editing (unpaid only)
- Invoice deletion
- Invoice filtering (status, date range)
- Invoice search
- PDF export

### 5. Tasks Management (`tasks.spec.ts`)
- Task creation with priorities
- Task status updates (pending, in progress, completed)
- Task editing
- Task deletion
- Task filtering (status, priority)
- Task search
- Overdue task highlighting
- Task pagination

### 6. Dashboard (`dashboard.spec.ts`)
- Dashboard loading
- Stats display (revenue, contacts)
- Stats updates after entity creation
- Navigation to all sections
- Quick actions (modals)
- Global search (Cmd+K / Ctrl+K)
- Notifications menu
- Theme toggle (light/dark mode)
- Responsive design (mobile, tablet)

## Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Running Tests

### All Tests
```bash
pnpm exec playwright test
```

### Specific Test File
```bash
pnpm exec playwright test auth.spec.ts
pnpm exec playwright test contacts.spec.ts
pnpm exec playwright test quotes.spec.ts
pnpm exec playwright test invoices.spec.ts
pnpm exec playwright test tasks.spec.ts
pnpm exec playwright test dashboard.spec.ts
```

### Run in UI Mode (Interactive)
```bash
pnpm exec playwright test --ui
```

### Run in Headed Mode (See Browser)
```bash
pnpm exec playwright test --headed
```

### Run Specific Test
```bash
pnpm exec playwright test -g "should successfully register a new user"
```

### Debug Mode
```bash
pnpm exec playwright test --debug
```

## Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL:** `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Workers:** 1 (sequential execution for auth state consistency)
- **Retries:** 2 on CI, 0 locally
- **Timeout:** 10s per action
- **Reporters:** HTML, JSON, List
- **Browsers:** Chromium (Firefox and WebKit commented out)

## Environment Variables

Create `.env.test` file for test-specific configuration:

```env
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

## Test Helpers

Located in `tests/e2e/helpers/test-helpers.ts`:

- `generateTestData()` - Generate unique test data with timestamps
- `login(page, email, password)` - Helper to login
- `register(page, data)` - Helper to register
- `logout(page)` - Helper to logout
- `waitForToast(page, message)` - Wait for toast notification
- `fillFieldValid(page, selector, value)` - Fill field and verify no errors
- `expectFieldError(page, selector, errorText)` - Expect validation error

## Reports

After running tests:

```bash
# Open HTML report
pnpm exec playwright show-report

# Reports are saved in playwright-report/
# - index.html (interactive report)
# - results.json (JSON data)
```

## CI/CD Integration

Tests automatically run in CI with:
- 2 retries on failure
- 1 worker (sequential)
- HTML and JSON reports
- Trace, screenshot, and video on failure

## Best Practices

1. **Independent Tests:** Each test creates its own test user
2. **Cleanup:** Tests clean up their data where possible
3. **Descriptive Names:** Test names clearly describe what they test
4. **Wait Strategies:** Use `waitForToast()` and Playwright's auto-waiting
5. **Selectors:** Prefer `data-testid` attributes, fall back to text content
6. **Assertions:** Use Playwright's built-in assertions for auto-retry

## Troubleshooting

### Tests Fail Locally
```bash
# Ensure dev server is running
pnpm dev

# Or configure webServer in playwright.config.ts to auto-start
```

### Timeout Errors
```bash
# Increase timeout in playwright.config.ts
# Or use --timeout flag
pnpm exec playwright test --timeout=30000
```

### Authentication Issues
```bash
# Clear browser state
rm -rf playwright/.auth/

# Tests create fresh users, so authentication should always work
```

### Screenshots and Videos
```bash
# Find test artifacts in:
# - playwright-report/
# - test-results/
```

## Adding New Tests

1. Create test file in `tests/e2e/`
2. Import helpers from `./helpers/test-helpers`
3. Follow existing patterns (beforeEach for auth, describe blocks)
4. Use meaningful test descriptions
5. Clean up test data when possible

Example:
```typescript
import { test, expect } from '@playwright/test';
import { generateTestData, login } from './helpers/test-helpers';

test.describe('My Feature', () => {
  let testUser: ReturnType<typeof generateTestData>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestData();
    // Register and login...
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)

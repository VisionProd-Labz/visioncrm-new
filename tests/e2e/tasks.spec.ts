/**
 * Tasks E2E Tests
 * Tests for task creation, status updates, and management
 */

import { test, expect } from '@playwright/test';
import { generateTestData, login, waitForToast } from './helpers/test-helpers';

test.describe('Tasks Management', () => {
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

    // Navigate to tasks page
    await page.click('a[href="/tasks"]');
    await expect(page).toHaveURL('/tasks');
  });

  test.describe('Task Creation', () => {
    test('should create a new task with required fields', async ({ page }) => {
      // Click "Nouvelle Tâche" button
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');

      // Wait for modal/form to open
      await expect(page.locator('text=Créer une tâche, text=Create task')).toBeVisible();

      // Fill required fields
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'high',
        dueDate: '2026-02-15',
      };

      await page.fill('input[name="title"]', taskData.title);
      await page.fill('textarea[name="description"]', taskData.description);

      // Select priority
      const prioritySelect = page.locator('select[name="priority"], button[role="combobox"]');
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        await page.click('text=Haute, text=High');
      }

      // Set due date
      await page.fill('input[name="dueDate"], input[type="date"]', taskData.dueDate);

      // Submit
      await page.click('button:has-text("Créer"), button:has-text("Create")');

      // Should show success toast
      await waitForToast(page, 'Tâche créée avec succès, Task created successfully');

      // Task should appear in list
      await expect(page.locator(`text=${taskData.title}`)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');

      // Try to submit without filling required fields
      await page.click('button:has-text("Créer"), button:has-text("Create")');

      // Should show validation errors
      await expect(page.locator('text=Titre requis, text=Title required')).toBeVisible();
    });

    test('should create task with all optional fields', async ({ page }) => {
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');

      const taskData = {
        title: 'Complete Task',
        description: 'Task with all fields filled',
        priority: 'urgent',
        dueDate: '2026-02-20',
        tags: 'important, client',
      };

      await page.fill('input[name="title"]', taskData.title);
      await page.fill('textarea[name="description"]', taskData.description);

      // Set priority
      const prioritySelect = page.locator('select[name="priority"], button[role="combobox"]');
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        await page.click('text=Urgente, text=Urgent');
      }

      await page.fill('input[name="dueDate"], input[type="date"]', taskData.dueDate);

      // Fill tags if available
      const tagsInput = page.locator('input[name="tags"]');
      if (await tagsInput.isVisible()) {
        await tagsInput.fill(taskData.tags);
      }

      await page.click('button:has-text("Créer"), button:has-text("Create")');

      await waitForToast(page, 'Tâche créée avec succès, Task created successfully');
      await expect(page.locator(`text=${taskData.title}`)).toBeVisible();
    });
  });

  test.describe('Task Status Updates', () => {
    test('should update task status to in progress', async ({ page }) => {
      // Create a task first
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Status Update Task');
      await page.fill('textarea[name="description"]', 'Testing status updates');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Find task row
      const taskRow = page.locator('text=Status Update Task').locator('..');

      // Update status to "in progress"
      const statusSelect = taskRow.locator('select[name="status"], button[role="combobox"]');
      await statusSelect.click();
      await page.click('text=En cours, text=In Progress');

      // Should show success toast
      await waitForToast(page, 'Statut mis à jour, Status updated');
    });

    test('should mark task as completed', async ({ page }) => {
      // Create a task
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Task to Complete');
      await page.fill('textarea[name="description"]', 'Will be marked as done');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Find and complete task
      const taskRow = page.locator('text=Task to Complete').locator('..');

      // Click complete checkbox or button
      const completeButton = taskRow.locator('button:has-text("Terminer"), input[type="checkbox"]');
      await completeButton.click();

      // Task should show as completed (strikethrough, different styling, etc.)
      await expect(page.locator('text=Task to Complete')).toHaveClass(/completed|done|line-through/);
    });
  });

  test.describe('Task Editing', () => {
    test('should edit an existing task', async ({ page }) => {
      // Create a task
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Original Task Title');
      await page.fill('textarea[name="description"]', 'Original description');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Find and click edit button
      const taskRow = page.locator('text=Original Task Title').locator('..');
      await taskRow.locator('button[aria-label="Edit"], button:has-text("Modifier")').first().click();

      // Wait for edit modal
      await expect(page.locator('text=Modifier la tâche, text=Edit task')).toBeVisible();

      // Update fields
      await page.fill('input[name="title"]', 'Updated Task Title');
      await page.fill('textarea[name="description"]', 'Updated description');

      // Save changes
      await page.click('button:has-text("Enregistrer"), button:has-text("Save")');

      await waitForToast(page, 'Tâche modifiée avec succès');

      // Verify changes
      await expect(page.locator('text=Updated Task Title')).toBeVisible();
      await expect(page.locator('text=Original Task Title')).not.toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test('should delete a task', async ({ page }) => {
      // Create a task to delete
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Task to Delete');
      await page.fill('textarea[name="description"]', 'Will be deleted');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Find and click delete button
      const taskRow = page.locator('text=Task to Delete').locator('..');
      await taskRow.locator('button[aria-label="Delete"], button:has-text("Supprimer")').first().click();

      // Confirm deletion
      await page.click('button:has-text("Confirmer"), button:has-text("Confirm")');

      await waitForToast(page, 'Tâche supprimée avec succès');

      // Task should no longer be visible
      await expect(page.locator('text=Task to Delete')).not.toBeVisible();
    });
  });

  test.describe('Task Filtering', () => {
    test('should filter tasks by status', async ({ page }) => {
      // Create tasks with different statuses
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Pending Task');
      await page.fill('textarea[name="description"]', 'Pending');
      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Filter by status
      const filterSelect = page.locator('select[name="filter"], button:has-text("Filtrer")');
      if (await filterSelect.isVisible()) {
        await filterSelect.click();
        await page.click('text=En attente, text=Pending');

        // Should show only pending tasks
        await expect(page.locator('text=Pending Task')).toBeVisible();
      }
    });

    test('should filter tasks by priority', async ({ page }) => {
      // Create tasks with different priorities
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'High Priority Task');
      await page.fill('textarea[name="description"]', 'High priority');

      const prioritySelect = page.locator('select[name="priority"], button[role="combobox"]');
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        await page.click('text=Haute, text=High');
      }

      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Filter by high priority
      const filterPriority = page.locator('select[name="priorityFilter"], button:has-text("Priorité")');
      if (await filterPriority.isVisible()) {
        await filterPriority.click();
        await page.click('text=Haute, text=High');

        await expect(page.locator('text=High Priority Task')).toBeVisible();
      }
    });
  });

  test.describe('Task Search', () => {
    test('should search tasks by title', async ({ page }) => {
      // Create multiple tasks
      const tasks = ['Search Task Alpha', 'Search Task Beta', 'Different Task'];

      for (const title of tasks) {
        await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
        await page.fill('input[name="title"]', title);
        await page.fill('textarea[name="description"]', `Description for ${title}`);
        await page.click('button:has-text("Créer"), button:has-text("Create")');
        await waitForToast(page, 'Tâche créée avec succès');
      }

      // Search for specific task
      const searchInput = page.locator('input[placeholder*="Rechercher"], input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Alpha');

        // Should show only matching task
        await expect(page.locator('text=Search Task Alpha')).toBeVisible();
        await expect(page.locator('text=Search Task Beta')).not.toBeVisible();
        await expect(page.locator('text=Different Task')).not.toBeVisible();
      }
    });
  });

  test.describe('Task Pagination', () => {
    test('should load more tasks with pagination', async ({ page }) => {
      // Check if "Load More" button exists
      const loadMoreButton = page.locator('button:has-text("Charger plus"), button:has-text("Load more")');

      if (await loadMoreButton.isVisible()) {
        const initialTaskCount = await page.locator('[data-testid="task-row"]').count();

        // Click load more
        await loadMoreButton.click();

        // Wait for loading
        await page.waitForTimeout(1000);

        // Should have more tasks or button should disappear
        const newTaskCount = await page.locator('[data-testid="task-row"]').count();
        expect(newTaskCount).toBeGreaterThanOrEqual(initialTaskCount);
      }
    });
  });

  test.describe('Task Due Dates', () => {
    test('should highlight overdue tasks', async ({ page }) => {
      // Create an overdue task
      await page.click('button:has-text("Nouvelle Tâche"), button:has-text("New Task")');
      await page.fill('input[name="title"]', 'Overdue Task');
      await page.fill('textarea[name="description"]', 'This task is overdue');

      // Set due date in the past
      await page.fill('input[name="dueDate"], input[type="date"]', '2025-01-01');

      await page.click('button:has-text("Créer"), button:has-text("Create")');
      await waitForToast(page, 'Tâche créée avec succès');

      // Task should be highlighted as overdue
      const overdueTask = page.locator('text=Overdue Task').locator('..');
      await expect(overdueTask).toHaveClass(/overdue|red|danger/);
    });
  });
});

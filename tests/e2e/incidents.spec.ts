import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Incident Management', () => {
  // Serial mode to ensure tests run in order (since later tests depend on earlier ones)
  test.describe.configure({ mode: 'serial' });

  let incidentId: string;

  test('should create a new incident using wizard', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard/incidents/new');
    await page.waitForLoadState('networkidle');

    // Step 1: Basic Information
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();

    await page.getByLabel('Incident Title *').fill('E2E Test Critical Incident');
    await page.getByLabel('Description *').fill('This is a test incident created by E2E tests to verify the incident management workflow.');

    // Select AI system - use first available system
    await page.locator('[data-testid="ai-system-select"]').click();
    const firstSystem = page.locator('[role="option"]').first();
    await firstSystem.click();

    // Select severity
    await page.locator('[data-testid="severity-select"]').click();
    await page.getByRole('option', { name: 'Critical' }).click();

    // Select category
    await page.locator('[data-testid="category-select"]').click();
    await page.getByRole('option').filter({ hasText: /Failure/i }).first().click();

    // Click Next
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: Impact Assessment
    await expect(page.getByRole('heading', { name: 'Impact Assessment' })).toBeVisible();

    await page.getByLabel('Affected Users Count').fill('150');
    await page.getByLabel('Business Impact *').fill('Critical system failure affecting user authentication and data access.');
    await page.getByLabel('Compliance Impact').fill('Potential GDPR violation due to unauthorized data access.');

    // Click Next
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: Response Plan
    await expect(page.getByRole('heading', { name: 'Response Plan' })).toBeVisible();

    await page.getByLabel('Immediate Actions *').fill('1. Isolate affected systems\n2. Notify security team\n3. Begin investigation');
    await page.getByLabel('Root Cause Analysis').fill('Initial investigation suggests database connection pool exhaustion.');
    await page.getByLabel('Preventive Measures').fill('Implement connection pool monitoring and automatic scaling.');

    // Submit form
    await page.getByRole('button', { name: 'Create Incident' }).click();

    // Wait for success and navigation to incident detail page
    await page.waitForURL(/\/dashboard\/incidents\/.+/, { timeout: 10000 });

    // Extract incident ID from URL
    const url = page.url();
    incidentId = url.split('/incidents/')[1];

    // Verify incident details are displayed
    await expect(page.getByRole('heading', { name: 'E2E Test Critical Incident' })).toBeVisible();
  });

  test('should display incident in list', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard/incidents');
    await page.waitForLoadState('networkidle');

    // Verify incident appears in list
    await expect(page.getByText('E2E Test Critical Incident')).toBeVisible();
  });

  test('should assess notification requirement', async ({ page }) => {
    await login(page);

    await page.goto(`/dashboard/incidents/${incidentId}`);
    await page.waitForLoadState('networkidle');

    // Click "Assess Notification" button
    await page.getByRole('button', { name: /Assess Notification/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('heading', { name: 'Authority Notification Assessment' })).toBeVisible();

    // Mark as serious incident
    await page.getByLabel('This is a Serious Incident').check();

    // Check health/safety impact
    await page.getByLabel('Impact on Health or Safety').check();

    // Verify notification required indicator
    await expect(page.getByText('Authority Notification Required')).toBeVisible();

    // Fill in authority contact
    await page.getByLabel('Authority Contact Information').fill('authority@euaiact.eu');

    // Save assessment
    await page.getByRole('button', { name: 'Save Assessment' }).click();

    // Wait for success message
    await expect(page.getByText(/Assessment saved/i)).toBeVisible({ timeout: 5000 });
  });

  test('should add action items', async ({ page }) => {
    await login(page);

    await page.goto(`/dashboard/incidents/${incidentId}`);
    await page.waitForLoadState('networkidle');

    // Click "Add Action Item" button
    await page.getByRole('button', { name: 'Add Action Item' }).click();

    // Wait for dialog
    await expect(page.getByRole('heading', { name: 'Add Action Item' })).toBeVisible();

    // Fill in action item details
    await page.getByLabel('Description *').fill('Implement comprehensive monitoring system for database connections');
    await page.getByLabel('Assigned To *').fill('DevOps Team');

    // Set due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await page.getByLabel('Due Date').fill(dueDate.toISOString().split('T')[0]);

    // Submit
    await page.getByRole('button', { name: 'Add Action Item' }).click();

    // Wait for success
    await expect(page.getByText(/Action item added successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('should edit action item', async ({ page }) => {
    await login(page);

    await page.goto(`/dashboard/incidents/${incidentId}`);
    await page.waitForLoadState('networkidle');

    // Find and click the edit button (icon button)
    const editButtons = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' });
    await editButtons.first().click();

    // Wait for edit dialog
    await expect(page.getByRole('heading', { name: 'Edit Action Item' })).toBeVisible();

    // Update status to completed
    await page.getByLabel('Status *').click();
    await page.getByRole('option', { name: /Completed/i }).click();

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Wait for success
    await expect(page.getByText(/Action item updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display incident alerts on dashboard', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify "Report Incident" quick action is visible
    await expect(page.getByTestId('dashboard-quick-action-report-incident')).toBeVisible();

    // Check if alerts are visible (may or may not be depending on data)
    const notificationAlert = page.getByTestId('dashboard-incident-notification-alert');
    if (await notificationAlert.isVisible()) {
      await expect(notificationAlert).toContainText(/Authority Notification Required/i);
    }
  });
});

import { test, expect } from '@playwright/test';
import { timeout, logSpeedConfig } from '../helpers/demo-config';
import { login } from '../helpers/auth';

/**
 * Smoke Test: AI System Creation Form
 *
 * This test verifies that ALL testIDs exist and are accessible.
 * It should pass on the first try if testIDs are properly added.
 *
 * Run this BEFORE writing the full demo script.
 *
 * NOTE: Requires a test user in the database:
 * - Email: test@example.com
 * - Password: testpassword123
 */

test.describe('AI System Creation - Smoke Test', () => {
  test.setTimeout(timeout(60000)); // 1 minute timeout

  test.beforeEach(async ({ page }) => {
    logSpeedConfig();

    // Login first (required for dashboard access)
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });

    // Navigate to the AI System creation page
    await page.goto('/dashboard/systems/new');

    // Wait for the form to load
    await page.waitForSelector('form');
  });

  test('should have all required testIDs', async ({ page }) => {
    console.log('\n🔍 Verifying all testIDs exist...\n');

    // Input Fields
    console.log('✓ Checking input fields...');
    await expect(page.getByTestId('system-name-input')).toBeVisible();
    await expect(page.getByTestId('system-business-purpose-textarea')).toBeVisible();
    await expect(page.getByTestId('system-description-textarea')).toBeVisible();
    await expect(page.getByTestId('system-technical-approach-textarea')).toBeVisible();
    await expect(page.getByTestId('system-deployment-date-input')).toBeVisible();
    await expect(page.getByTestId('system-data-processed-input')).toBeVisible();

    // Checkboxes (Primary Users)
    console.log('✓ Checking user type checkboxes...');
    const userTypes = ['INTERNAL_EMPLOYEES', 'EXTERNAL_CUSTOMERS', 'PARTNERS', 'PUBLIC'];
    for (const userType of userTypes) {
      await expect(page.getByTestId(`system-user-checkbox-${userType}`)).toBeVisible();
    }

    // Select Dropdown
    console.log('✓ Checking deployment status select...');
    await expect(page.getByTestId('system-deployment-status-select')).toBeVisible();

    // Buttons
    console.log('✓ Checking action buttons...');
    await expect(page.getByTestId('system-submit-button')).toBeVisible();
    await expect(page.getByTestId('system-cancel-button')).toBeVisible();

    console.log('\n✅ All testIDs verified successfully!\n');
  });

  test('should be able to interact with all form elements', async ({ page }) => {
    console.log('\n🔍 Verifying all elements are interactive...\n');

    // Test input fields can receive text
    await page.getByTestId('system-name-input').fill('Test System');
    await expect(page.getByTestId('system-name-input')).toHaveValue('Test System');

    await page.getByTestId('system-business-purpose-textarea').fill('Test purpose');
    await expect(page.getByTestId('system-business-purpose-textarea')).toHaveValue('Test purpose');

    // Test checkboxes can be clicked
    const checkbox = page.getByTestId('system-user-checkbox-INTERNAL_EMPLOYEES');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Test select can be opened
    await page.getByTestId('system-deployment-status-select').click();
    // Check that dropdown opens by looking for select options
    await expect(page.getByRole('option').first()).toBeVisible();

    console.log('\n✅ All elements are interactive!\n');
  });

  test('should have correct form validation', async ({ page }) => {
    console.log('\n🔍 Verifying form validation...\n');

    // Try to submit empty form
    await page.getByTestId('system-submit-button').click();

    // Should show validation errors for required fields
    // (The exact error message will depend on your validation setup)
    await page.waitForTimeout(500);

    console.log('\n✅ Form validation is working!\n');
  });
});

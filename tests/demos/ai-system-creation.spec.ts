import { test, expect } from '@playwright/test';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, smoothClick, smoothType } from '../helpers/cursor-tracker';
import { login } from '../helpers/auth';
import { sampleHRSystem } from '../helpers/seed-data';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser } from '../helpers/database';

/**
 * Full Demo: AI System Creation
 *
 * This demo showcases the complete workflow for creating an AI system
 * in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - DEMO_SPEED=fast npx playwright test tests/demos/ai-system-creation.spec.ts (development)
 * - DEMO_SPEED=slow npx playwright test tests/demos/ai-system-creation.spec.ts --headed (video recording)
 */

test.describe('AI System Creation - Full Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
  });

  // Clean up test data before each test for clean demo videos
  test.beforeEach(async () => {
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData();
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should create an AI system with professional demo', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting AI System Creation Demo\n');

    // Step 1: Login
    console.log('📝 Step 1: Login to the application');

    // Navigate to homepage first to establish context
    await page.goto('/');

    // Clear browser storage to avoid stale session issues
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Add a longer delay to ensure server is fully ready (critical with resource constraints)
    await page.waitForTimeout(wait(5000));

    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.waitForTimeout(wait(1000));

    // Step 2: Navigate directly to the new system page
    console.log('📝 Step 2: Navigate to Create AI System page');
    await page.goto('/dashboard/systems/new');
    await page.waitForTimeout(wait(2000));

    // Step 3: Fill in System Name
    console.log('📝 Step 3: Fill in System Name');
    const nameInput = page.getByTestId('system-name-input');
    await smoothType(page, nameInput, sampleHRSystem.name);
    await page.waitForTimeout(wait(1000));

    // Step 4: Fill in Business Purpose
    console.log('📝 Step 4: Fill in Business Purpose');
    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await smoothType(page, purposeTextarea, sampleHRSystem.businessPurpose);
    await page.waitForTimeout(wait(1500));

    // Step 5: Fill in Technical Approach (optional)
    console.log('📝 Step 5: Fill in Technical Approach');
    const technicalTextarea = page.getByTestId('system-technical-approach-textarea');
    if (sampleHRSystem.technicalDescription) {
      await smoothType(page, technicalTextarea, sampleHRSystem.technicalDescription);
    }
    await page.waitForTimeout(wait(1500));

    // Step 6: Select Primary Users
    console.log('📝 Step 6: Select Primary Users');
    for (const userType of sampleHRSystem.primaryUsers) {
      const checkbox = page.getByTestId(`system-user-checkbox-${userType}`);
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(500));
    }
    await page.waitForTimeout(wait(1000));

    // Step 7: Select Deployment Status
    console.log('📝 Step 7: Select Deployment Status');
    const deploymentSelect = page.getByTestId('system-deployment-status-select');
    await smoothClick(page, deploymentSelect);
    await page.waitForTimeout(wait(500));

    // Click the option matching the deployment status
    const deploymentOption = page.getByRole('option', { name: new RegExp(sampleHRSystem.deploymentStatus.replace('_', ' '), 'i') });
    await deploymentOption.click();
    await page.waitForTimeout(wait(1000));

    // Step 8: Add Data Categories
    console.log('📝 Step 8: Add Data Categories');
    const dataInput = page.getByTestId('system-data-processed-input');

    for (const category of sampleHRSystem.dataCategories) {
      await smoothType(page, dataInput, category);
      await page.waitForTimeout(wait(500));

      // Press Enter to add the tag
      await dataInput.press('Enter');
      await page.waitForTimeout(wait(800));
    }

    // Step 9: Review the form
    console.log('📝 Step 9: Review the filled form');
    await page.waitForTimeout(wait(2000));

    // Scroll to submit button
    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1000));

    // Step 10: Submit the form
    console.log('📝 Step 10: Submit the form');
    await smoothClick(page, submitButton);
    await page.waitForTimeout(wait(1000));

    // Wait for navigation to systems list (NOT the /new page)
    console.log('Waiting for navigation...');
    try {
      await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });
      await page.waitForTimeout(wait(2000));
    } catch (error) {
      // If navigation failed, check for error message
      const errorAlert = page.locator('[role="alert"]').first();
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        console.log('❌ Form error:', errorText);
        throw new Error(`Form submission failed: ${errorText || 'Unknown error'}`);
      }
      // No alert found, re-throw original error
      throw error;
    }

    // Step 11: Verify the system was created
    console.log('📝 Step 11: Verify the system appears in the list');
    await expect(page.getByText(sampleHRSystem.name).first()).toBeVisible();
    await page.waitForTimeout(wait(2000));

    console.log('\n✅ Demo completed successfully!\n');
  });


  test('should demonstrate form validation', async ({ page }) => {
    logSpeedConfig();
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Form Validation Demo\n');

    // Navigate to homepage first to establish context
    await page.goto('/');

    // Clear browser storage to avoid stale session issues
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Add a longer delay to ensure server is fully ready
    await page.waitForTimeout(wait(5000));

    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.goto('/dashboard/systems/new');
    await page.waitForTimeout(wait(1000));

    console.log('📝 Attempting to submit empty form');

    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(500));

    await smoothClick(page, submitButton);
    await page.waitForTimeout(wait(2000));

    // Form should not navigate (validation prevents submission)
    await expect(page).toHaveURL(/\/dashboard\/systems\/new/);

    console.log('📝 Validation errors should be visible');
    await page.waitForTimeout(wait(2000));

    console.log('\n✅ Validation demo completed!\n');
  });

});

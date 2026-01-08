import { test, expect } from '@playwright/test';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, reEnableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { login } from '../helpers/auth';
import { sampleHRSystem, sampleHRClassification } from '../helpers/seed-data';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser } from '../helpers/database';

/**
 * Full Demo: Risk Classification
 *
 * This demo showcases the complete workflow for classifying an AI system's risk level
 * according to the EU AI Act compliance framework.
 *
 * Prerequisites: An AI system must exist before classification can be performed.
 * This demo first creates an AI system, then classifies it as HIGH_RISK.
 *
 * Run with:
 * - DEMO_SPEED=fast npx playwright test tests/demos/risk-classification.spec.ts (development)
 * - DEMO_SPEED=slow npx playwright test tests/demos/risk-classification.spec.ts --headed (video recording)
 */

test.describe.configure({ mode: 'serial' }); // Run tests one at a time to avoid auth conflicts

test.describe('Risk Classification - Full Demo', () => {
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

  test('should classify an AI system as HIGH_RISK with professional demo', async ({ page }) => {
    logSpeedConfig();

    console.log('\n🎬 Starting Risk Classification Demo\n');

    // Step 1: Login
    console.log('📝 Step 1: Login to the application');

    // Navigate to homepage first to establish context
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Enable cursor tracking AFTER page load for professional appearance
    await enableCursorTracking(page);

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

    // Re-enable cursor after login navigation
    await reEnableCursorTracking(page);

    // Step 2: Create an AI system first (prerequisite)
    console.log('📝 Step 2: Create AI System (prerequisite for classification)');
    await page.goto('/dashboard/systems/new');
    await page.waitForLoadState('domcontentloaded');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(1500));

    // Fill in the AI system form quickly
    const nameInput = page.getByTestId('system-name-input');
    await smoothClick(page, nameInput);
    await nameInput.fill(sampleHRSystem.name);
    await page.waitForTimeout(wait(500));

    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await smoothClick(page, purposeTextarea);
    await purposeTextarea.fill(sampleHRSystem.businessPurpose);
    await page.waitForTimeout(wait(500));

    // Select primary users
    for (const userType of sampleHRSystem.primaryUsers) {
      const checkbox = page.getByTestId(`system-user-checkbox-${userType}`);
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(300));
    }

    // Select deployment status
    const deploymentSelect = page.getByTestId('system-deployment-status-select');
    await smoothClick(page, deploymentSelect);
    await page.waitForTimeout(wait(300));
    const deploymentOption = page.getByRole('option', {
      name: new RegExp(sampleHRSystem.deploymentStatus.replace('_', ' '), 'i')
    });
    await deploymentOption.click();
    await page.waitForTimeout(wait(500));

    // Add data categories
    const dataInput = page.getByTestId('system-data-processed-input');
    for (const category of sampleHRSystem.dataCategories) {
      await smoothClick(page, dataInput);
      await dataInput.fill(category);
      await page.waitForTimeout(wait(300));
      await dataInput.press('Enter');
      await page.waitForTimeout(wait(300));
    }

    // Submit AI system
    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(500));
    await smoothClick(page, submitButton);

    // Wait for navigation to systems list
    await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });
    await page.waitForTimeout(wait(1500));

    console.log('✅ AI System created successfully\n');

    // Step 3: Navigate to Classification
    console.log('📝 Step 3: Navigate to Risk Classification page');
    await page.goto('/dashboard/classification/new');
    await page.waitForLoadState('domcontentloaded');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(2000));

    // Step 4: Select AI System (Step 1 of wizard)
    console.log('📝 Step 4: Select AI System for classification');
    const systemSelect = page.getByTestId('classification-system-select');
    await smoothClick(page, systemSelect);
    await page.waitForTimeout(wait(800));

    // Select the HR system we just created
    const systemOption = page.getByRole('option', { name: new RegExp(sampleHRSystem.name, 'i') }).first();
    await smoothClick(page, systemOption);
    await page.waitForTimeout(wait(1500));

    // Review system information displayed
    await page.waitForTimeout(wait(1500));

    // Move to next step
    const step1NextButton = page.getByTestId('classification-step1-next');
    await smoothClick(page, step1NextButton);
    await page.waitForTimeout(wait(1500));

    // Step 5: Prohibited Practices (Step 2 of wizard)
    console.log('📝 Step 5: Check Prohibited Practices');
    console.log('   No prohibited practices for HR recruitment system');
    await page.waitForTimeout(wait(2000));

    // Move to next step (no checkboxes selected)
    const step2NextButton = page.getByTestId('classification-step2-next');
    await smoothClick(page, step2NextButton);
    await page.waitForTimeout(wait(1500));

    // Step 6: High-Risk Categories (Step 3 of wizard)
    console.log('📝 Step 6: Select High-Risk Categories');
    console.log('   This system falls under multiple high-risk categories:');

    // Select all high-risk categories from seed data
    for (const category of sampleHRClassification.highRiskCategories || []) {
      console.log(`   - ${category}`);
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
      const checkbox = page.getByTestId(`classification-highrisk-checkbox-${categorySlug}`);
      await checkbox.scrollIntoViewIfNeeded();
      await page.waitForTimeout(wait(500));
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(1500));
    }

    // Move to next step
    const step3NextButton = page.getByTestId('classification-step3-next');
    await smoothClick(page, step3NextButton);
    await page.waitForTimeout(wait(1500));

    // Step 7: Additional Questions (Step 4 of wizard)
    console.log('📝 Step 7: Answer Additional Questions');

    // Check "interacts with persons"
    console.log('   Marking: This AI system interacts with natural persons');
    const interactsCheckbox = page.getByTestId('classification-interacts-checkbox');
    await smoothClick(page, interactsCheckbox);
    await page.waitForTimeout(wait(1500));

    // Fill in classification reasoning
    console.log('   Providing detailed reasoning');
    const reasoningTextarea = page.getByTestId('classification-reasoning-textarea');
    await smoothClick(page, reasoningTextarea);
    await page.waitForTimeout(wait(500));
    await reasoningTextarea.fill(sampleHRClassification.reasoning || '');
    await page.waitForTimeout(wait(2000));

    // Fill in applicable requirements
    console.log('   Listing applicable EU AI Act requirements');
    const requirementsTextarea = page.getByTestId('classification-requirements-textarea');
    await smoothClick(page, requirementsTextarea);
    await page.waitForTimeout(wait(500));
    const requirementsText = sampleHRClassification.applicableRequirements?.join(', ') || '';
    await requirementsTextarea.fill(requirementsText);
    await page.waitForTimeout(wait(2000));

    // Move to review step
    const step4NextButton = page.getByTestId('classification-step4-next');
    await smoothClick(page, step4NextButton);
    await page.waitForTimeout(wait(1500));

    // Step 8: Review Classification (Step 5 of wizard)
    console.log('📝 Step 8: Review Classification');
    console.log('   Risk Level: HIGH_RISK (orange alert should be visible)');

    // Verify HIGH_RISK alert is visible
    const highRiskAlert = page.locator('[role="alert"]').filter({ hasText: /High-Risk AI System/i });
    await expect(highRiskAlert).toBeVisible();
    await page.waitForTimeout(wait(3000));

    // Scroll to submit button
    const classificationSubmitButton = page.getByTestId('classification-submit-button');
    await classificationSubmitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1000));

    // Step 9: Submit Classification
    console.log('📝 Step 9: Submit Classification');
    await smoothClick(page, classificationSubmitButton);
    await page.waitForTimeout(wait(1000));

    // Wait for navigation to classification list
    try {
      await page.waitForURL(url => url.pathname === '/dashboard/classification', { timeout: 15000 });
      await page.waitForTimeout(wait(2000));
    } catch (error) {
      // If navigation failed, check for error message
      const errorAlert = page.locator('[role="alert"]').first();
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        console.log('❌ Classification error:', errorText);
        throw new Error(`Classification submission failed: ${errorText || 'Unknown error'}`);
      }
      throw error;
    }

    // Step 10: Verify the classification was created
    console.log('📝 Step 10: Verify classification appears in the list');
    await expect(page.getByText(sampleHRSystem.name).first()).toBeVisible();

    // Verify HIGH_RISK badge is visible
    await expect(page.locator('text=HIGH_RISK').or(page.locator('text=High Risk')).first()).toBeVisible();
    await page.waitForTimeout(wait(2000));

    console.log('\n✅ Risk Classification Demo completed successfully!\n');
  });

  test('should demonstrate classification wizard navigation', async ({ page }) => {
    logSpeedConfig();

    console.log('\n🎬 Starting Classification Wizard Navigation Demo\n');

    // Navigate to homepage first to establish context
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Enable cursor tracking AFTER page load
    await enableCursorTracking(page);

    // Clear browser storage to avoid stale session issues
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Add a longer delay to ensure server is fully ready (critical with resource constraints)
    await page.waitForTimeout(wait(5000));

    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });

    // Create a system first
    await page.goto('/dashboard/systems/new');
    await page.waitForTimeout(wait(500));

    const nameInput = page.getByTestId('system-name-input');
    await nameInput.fill(sampleHRSystem.name);
    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await purposeTextarea.fill(sampleHRSystem.businessPurpose);

    for (const userType of sampleHRSystem.primaryUsers) {
      await page.getByTestId(`system-user-checkbox-${userType}`).click();
    }

    const deploymentSelect = page.getByTestId('system-deployment-status-select');
    await deploymentSelect.click();
    await page.getByRole('option', {
      name: new RegExp(sampleHRSystem.deploymentStatus.replace('_', ' '), 'i')
    }).click();

    // Add data categories
    const dataInput = page.getByTestId('system-data-processed-input');
    for (const category of sampleHRSystem.dataCategories) {
      await dataInput.fill(category);
      await dataInput.press('Enter');
      await page.waitForTimeout(wait(200));
    }

    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });

    // Now test the wizard navigation
    await page.goto('/dashboard/classification/new');
    await page.waitForTimeout(wait(1000));

    console.log('📝 Testing forward navigation through all steps');

    // Step 1 -> 2
    const systemSelect = page.getByTestId('classification-system-select');
    await systemSelect.click();
    await page.getByRole('option', { name: new RegExp(sampleHRSystem.name, 'i') }).click();
    await page.waitForTimeout(wait(500));
    await smoothClick(page, page.getByTestId('classification-step1-next'));
    await page.waitForTimeout(wait(800));

    // Step 2 -> 3
    await smoothClick(page, page.getByTestId('classification-step2-next'));
    await page.waitForTimeout(wait(800));

    // Step 3 -> 4
    await smoothClick(page, page.getByTestId('classification-step3-next'));
    await page.waitForTimeout(wait(800));

    console.log('📝 Testing backward navigation');

    // Step 4 -> 3
    await smoothClick(page, page.getByTestId('classification-step4-back'));
    await page.waitForTimeout(wait(800));

    // Step 3 -> 2
    await smoothClick(page, page.getByTestId('classification-step3-back'));
    await page.waitForTimeout(wait(800));

    // Step 2 -> 1
    await smoothClick(page, page.getByTestId('classification-step2-back'));
    await page.waitForTimeout(wait(800));

    console.log('\n✅ Wizard Navigation Demo completed!\n');
  });

  test('should demonstrate viewing classification details', async ({ page }) => {
    logSpeedConfig();

    console.log('\n🎬 Starting Risk Classification Detail View Demo\n');

    // Step 1: Login
    console.log('📝 Step 1: Login to the application');

    // Navigate to homepage first to establish context
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Enable cursor tracking AFTER page load
    await enableCursorTracking(page);

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

    // Step 2: Create AI System (prerequisite)
    console.log('📝 Step 2: Create AI System (prerequisite)');
    await page.goto('/dashboard/systems/new');
    await page.waitForTimeout(wait(500));

    const nameInput = page.getByTestId('system-name-input');
    await nameInput.fill(sampleHRSystem.name);
    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await purposeTextarea.fill(sampleHRSystem.businessPurpose);

    for (const userType of sampleHRSystem.primaryUsers) {
      await page.getByTestId(`system-user-checkbox-${userType}`).click();
    }

    const deploymentSelect = page.getByTestId('system-deployment-status-select');
    await deploymentSelect.click();
    await page.getByRole('option', {
      name: new RegExp(sampleHRSystem.deploymentStatus.replace('_', ' '), 'i')
    }).click();

    const dataInput = page.getByTestId('system-data-processed-input');
    for (const category of sampleHRSystem.dataCategories) {
      await dataInput.fill(category);
      await dataInput.press('Enter');
      await page.waitForTimeout(wait(200));
    }

    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });
    await page.waitForTimeout(wait(500));

    // Step 3: Create Risk Classification (prerequisite)
    console.log('📝 Step 3: Create Risk Classification (prerequisite)');
    await page.goto('/dashboard/classification/new');
    await page.waitForTimeout(wait(500));

    const systemSelect = page.getByTestId('classification-system-select');
    await systemSelect.click();
    await page.getByRole('option', { name: new RegExp(sampleHRSystem.name, 'i') }).first().click();
    await page.waitForTimeout(wait(500));

    // Step 1 -> 2
    await page.getByTestId('classification-step1-next').click();
    await page.waitForTimeout(wait(500));

    // Step 2 -> 3
    await page.getByTestId('classification-step2-next').click();
    await page.waitForTimeout(wait(500));

    // Select high-risk categories
    for (const category of sampleHRClassification.highRiskCategories || []) {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
      const checkbox = page.getByTestId(`classification-highrisk-checkbox-${categorySlug}`);
      await checkbox.scrollIntoViewIfNeeded();
      await checkbox.click();
      await page.waitForTimeout(wait(300));
    }

    // Step 3 -> 4
    await page.getByTestId('classification-step3-next').click();
    await page.waitForTimeout(wait(500));

    // Fill in additional questions
    await page.getByTestId('classification-interacts-checkbox').click();
    await page.waitForTimeout(wait(300));

    const reasoningTextarea = page.getByTestId('classification-reasoning-textarea');
    await reasoningTextarea.fill(sampleHRClassification.reasoning || '');
    await page.waitForTimeout(wait(500));

    const requirementsTextarea = page.getByTestId('classification-requirements-textarea');
    const requirementsText = sampleHRClassification.applicableRequirements?.join(', ') || '';
    await requirementsTextarea.fill(requirementsText);
    await page.waitForTimeout(wait(500));

    // Step 4 -> 5
    await page.getByTestId('classification-step4-next').click();
    await page.waitForTimeout(wait(500));

    // Submit classification
    const classificationSubmitButton = page.getByTestId('classification-submit-button');
    await classificationSubmitButton.scrollIntoViewIfNeeded();
    await classificationSubmitButton.click();
    await page.waitForURL(url => url.pathname === '/dashboard/classification', { timeout: 15000 });
    await page.waitForTimeout(wait(1000));

    console.log('✅ Prerequisites completed\n');

    // Step 4: Navigate to Classification List
    console.log('📝 Step 4: View classification list');
    await page.waitForTimeout(wait(1500));

    // Step 5: Click on "View Details" button to see classification details
    console.log('📝 Step 5: Click on "View Details" to see classification details');
    const viewDetailsButton = page.getByRole('link', { name: 'View Details' }).first();
    await smoothClick(page, viewDetailsButton);
    await page.waitForURL(/\/dashboard\/classification\/.*/, { timeout: 10000 });
    await page.waitForTimeout(wait(1500));

    // Step 6: Review Risk Badge
    console.log('📝 Step 6: Review HIGH_RISK badge and alert');
    const riskBadge = page.getByTestId('classification-detail-risk-badge');
    await expect(riskBadge).toBeVisible();
    await riskBadge.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Step 7: Review Risk Alert
    const riskAlert = page.getByTestId('classification-detail-risk-alert');
    await expect(riskAlert).toBeVisible();
    await riskAlert.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Step 8: Review AI System Information
    console.log('📝 Step 7: Review AI System Information');
    const systemInfoCard = page.getByTestId('classification-detail-system-info-card');
    await systemInfoCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2500));

    // Step 9: Review Classification Details
    console.log('📝 Step 8: Review Classification Details');
    const detailsCard = page.getByTestId('classification-detail-details-card');
    await detailsCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1500));

    // Verify high-risk categories are displayed
    const highRiskCategories = page.getByTestId('classification-detail-high-risk-categories');
    await expect(highRiskCategories).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Review reasoning
    const reasoning = page.getByTestId('classification-detail-reasoning');
    await reasoning.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Review requirements
    const requirements = page.getByTestId('classification-detail-requirements');
    await requirements.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Step 10: Review Compliance Requirements
    console.log('📝 Step 9: Review Compliance Requirements');
    const complianceCard = page.getByTestId('classification-detail-compliance-card');
    await complianceCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2500));

    // Step 11: Highlight "Start Gap Assessment" button
    console.log('📝 Step 10: Highlight next action - Gap Assessment');
    const gapAssessmentButton = page.getByTestId('classification-detail-gap-assessment-button');
    await gapAssessmentButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Hover over the button to highlight it
    await gapAssessmentButton.hover();
    await page.waitForTimeout(wait(2500));

    // Scroll back to top to show the full page one more time
    console.log('📝 Step 11: Final review of classification details');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(wait(2000));

    console.log('\n✅ Risk Classification Detail View Demo completed!\n');
  });
});

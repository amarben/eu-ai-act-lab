import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser } from '../helpers/database';
import { enableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { logSpeedConfig, wait, timeout } from '../helpers/demo-config';
import {
  sampleHRSystem,
  sampleHRClassification,
} from '../helpers/seed-data';

/**
 * Complete Workflow Demo
 *
 * This demo showcases the end-to-end EU AI Act compliance workflow:
 * 1. Dashboard Overview - View compliance status and quick actions
 * 2. Create AI System - Register a new AI system
 * 3. Risk Classification - Classify the system's risk level
 * 4. View Classification Details - Review detailed classification results
 * 5. Return to Dashboard - See updated compliance status
 *
 * Duration: ~2-3 minutes in normal speed
 *
 * Run with:
 * - DEMO_SPEED=fast npx playwright test tests/demos/complete-workflow.spec.ts (development)
 * - DEMO_SPEED=normal npx playwright test tests/demos/complete-workflow.spec.ts --headed (video recording)
 */

test.describe('Complete Workflow Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
  });

  // Clean up test data before each test for clean demo videos
  test.beforeEach(async () => {
    console.log('🧹 Cleaning up test data (AI Systems only, keeping user)...');
    // Temporarily commented out to debug login issues
    await cleanupTestData();
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete EU AI Act compliance workflow', async ({ page }) => {
    logSpeedConfig();
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Complete Workflow Demo\n');

    // ========================================
    // STEP 1: Login and Dashboard Overview
    // ========================================
    console.log('📝 Step 1: Login and view dashboard overview');

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

    // Wait for dashboard to fully load
    await page.waitForTimeout(wait(1500));

    // Show dashboard stats
    const statsGrid = page.getByTestId('dashboard-stats-grid');
    await expect(statsGrid).toBeVisible();
    await statsGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Show risk distribution and recent activity
    const riskDistributionCard = page.getByTestId('dashboard-risk-distribution-card');
    await riskDistributionCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Show quick actions
    console.log('📝 Step 2: Review quick actions');
    const quickActionsCard = page.getByTestId('dashboard-quick-actions-card');
    await quickActionsCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // ========================================
    // STEP 2: Create AI System
    // ========================================
    console.log('📝 Step 3: Create a new AI system');
    const quickActionButton = page.getByTestId('dashboard-quick-action-add-system');
    await smoothClick(page, quickActionButton);
    await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 10000 });
    await page.waitForTimeout(wait(1000));

    // Click "Add Your First AI System" button (or "Add AI System" if systems exist)
    // Use .first() since both buttons may be visible
    const addSystemButton = page.getByTestId('add-first-system-button').or(page.getByTestId('add-system-button')).first();
    await smoothClick(page, addSystemButton);
    await page.waitForURL(url => url.pathname === '/dashboard/systems/new', { timeout: 10000 });
    await page.waitForTimeout(wait(1500));

    // Fill in basic information
    console.log('📝 Step 4: Fill in AI system information');
    const nameInput = page.getByTestId('system-name-input');
    await smoothClick(page, nameInput);
    await nameInput.fill(sampleHRSystem.name);
    await page.waitForTimeout(wait(1000));

    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await smoothClick(page, purposeTextarea);
    await purposeTextarea.fill(sampleHRSystem.businessPurpose);
    await page.waitForTimeout(wait(1500));

    // Select primary users
    console.log('📝 Step 5: Select primary users');
    for (const userType of sampleHRSystem.primaryUsers) {
      const checkbox = page.getByTestId(`system-user-checkbox-${userType}`);
      await checkbox.scrollIntoViewIfNeeded();
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(500));
    }

    // Select deployment status
    console.log('📝 Step 6: Select deployment status');
    const deploymentSelect = page.getByTestId('system-deployment-status-select');
    await deploymentSelect.scrollIntoViewIfNeeded();
    await smoothClick(page, deploymentSelect);
    await page.waitForTimeout(wait(500));
    await page.getByRole('option', {
      name: new RegExp(sampleHRSystem.deploymentStatus.replace('_', ' '), 'i')
    }).click();
    await page.waitForTimeout(wait(1000));

    // Add data categories
    console.log('📝 Step 7: Add data categories');
    const dataInput = page.getByTestId('system-data-processed-input');
    await dataInput.scrollIntoViewIfNeeded();
    await smoothClick(page, dataInput);
    for (const category of sampleHRSystem.dataCategories) {
      await dataInput.fill(category);
      await page.waitForTimeout(wait(500));
      await dataInput.press('Enter');
      await page.waitForTimeout(wait(500));
    }

    // Submit the system
    console.log('📝 Step 8: Submit AI system');
    const submitButton = page.getByTestId('system-submit-button');
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1000));
    await smoothClick(page, submitButton);
    await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });
    await page.waitForTimeout(wait(1500));

    // Show the created system in the list
    console.log('📝 Step 9: View newly created system');
    const systemCard = page.getByTestId('systems-grid');
    await expect(systemCard).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ========================================
    // STEP 3: Risk Classification
    // ========================================
    console.log('📝 Step 10: Navigate to risk classification');
    await page.goto('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(1500));

    // Click "New Classification" - use Link selector since it's wrapped in asChild
    const newClassificationButton = page.getByRole('link', { name: /new classification/i });
    await smoothClick(page, newClassificationButton);
    await page.waitForURL(url => url.pathname === '/dashboard/classification/new', { timeout: 10000 });
    await page.waitForTimeout(wait(1500));

    // Select AI system
    console.log('📝 Step 11: Select AI system to classify');
    const systemSelect = page.getByTestId('classification-system-select');
    await smoothClick(page, systemSelect);
    await page.waitForTimeout(wait(500));
    await page.getByRole('option', { name: new RegExp(sampleHRSystem.name, 'i') }).first().click();
    await page.waitForTimeout(wait(1500));

    // Navigate through wizard steps
    console.log('📝 Step 12: Navigate through classification wizard');

    // Step 1: Prohibited Practices
    await page.getByTestId('classification-step1-next').click();
    await page.waitForTimeout(wait(1000));

    // Step 2: High-Risk Categories (Annex II)
    await page.getByTestId('classification-step2-next').click();
    await page.waitForTimeout(wait(1000));

    // Step 3: High-Risk Categories (Annex III) - Select categories
    console.log('📝 Step 13: Select high-risk categories');
    for (const category of sampleHRClassification.highRiskCategories || []) {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
      const checkbox = page.getByTestId(`classification-highrisk-checkbox-${categorySlug}`);
      await checkbox.scrollIntoViewIfNeeded();
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(800));
    }

    await page.getByTestId('classification-step3-next').click();
    await page.waitForTimeout(wait(1000));

    // Step 4: Additional Questions
    console.log('📝 Step 14: Answer additional questions');
    const interactsCheckbox = page.getByTestId('classification-interacts-checkbox');
    await interactsCheckbox.scrollIntoViewIfNeeded();
    await smoothClick(page, interactsCheckbox);
    await page.waitForTimeout(wait(1000));

    const reasoningTextarea = page.getByTestId('classification-reasoning-textarea');
    await reasoningTextarea.scrollIntoViewIfNeeded();
    await smoothClick(page, reasoningTextarea);
    await reasoningTextarea.fill(sampleHRClassification.reasoning || '');
    await page.waitForTimeout(wait(1500));

    const requirementsTextarea = page.getByTestId('classification-requirements-textarea');
    await requirementsTextarea.scrollIntoViewIfNeeded();
    await smoothClick(page, requirementsTextarea);
    const requirementsText = sampleHRClassification.applicableRequirements?.join(', ') || '';
    await requirementsTextarea.fill(requirementsText);
    await page.waitForTimeout(wait(1500));

    await page.getByTestId('classification-step4-next').click();
    await page.waitForTimeout(wait(1000));

    // Step 5: Review and Submit
    console.log('📝 Step 15: Review classification summary');

    // Verify HIGH_RISK alert is visible
    const highRiskAlert = page.locator('[role="alert"]').filter({ hasText: /High-Risk AI System/i });
    await expect(highRiskAlert).toBeVisible();
    await page.waitForTimeout(wait(2500));

    const classificationSubmitButton = page.getByTestId('classification-submit-button');
    await classificationSubmitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1000));
    await smoothClick(page, classificationSubmitButton);
    await page.waitForURL(url => url.pathname === '/dashboard/classification', { timeout: 15000 });
    await page.waitForTimeout(wait(1500));

    // ========================================
    // STEP 4: View Classification Details
    // ========================================
    console.log('📝 Step 16: View classification details');
    const viewDetailsButton = page.getByRole('link', { name: 'View Details' }).first();
    await smoothClick(page, viewDetailsButton);
    await page.waitForURL(/\/dashboard\/classification\/.*/, { timeout: 10000 });
    await page.waitForTimeout(wait(1500));

    // Show risk badge and alert
    const riskBadge = page.getByTestId('classification-detail-risk-badge');
    await expect(riskBadge).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Show system information
    const systemInfoCard = page.getByTestId('classification-detail-system-info-card');
    await systemInfoCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Show classification details
    const detailsCard = page.getByTestId('classification-detail-details-card');
    await detailsCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2000));

    // Show compliance requirements
    const complianceCard = page.getByTestId('classification-detail-compliance-card');
    await complianceCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2500));

    // Highlight "Start Gap Assessment" button
    const gapAssessmentButton = page.getByTestId('classification-detail-gap-assessment-button');
    await gapAssessmentButton.scrollIntoViewIfNeeded();
    await gapAssessmentButton.hover();
    await page.waitForTimeout(wait(2000));

    // ========================================
    // STEP 5: Return to Dashboard
    // ========================================
    console.log('📝 Step 17: Return to dashboard to see updated status');
    await page.goto('/dashboard');
    await page.waitForTimeout(wait(1500));

    // Show updated stats
    const updatedStats = page.getByTestId('dashboard-stats-grid');
    await expect(updatedStats).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Show compliance alert (should now appear)
    const complianceAlert = page.getByTestId('dashboard-compliance-alert');
    await complianceAlert.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(2500));

    // Scroll back to top for final overview
    console.log('📝 Step 18: Final dashboard overview');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(wait(2500));

    console.log('\n✅ Complete Workflow Demo completed!\n');
    console.log('Summary:');
    console.log('  ✓ Created AI System: ' + sampleHRSystem.name);
    console.log('  ✓ Classified as: HIGH_RISK');
    console.log('  ✓ Reviewed compliance requirements');
    console.log('  ✓ Updated dashboard with compliance status\n');
  });
});

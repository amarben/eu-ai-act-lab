import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, reEnableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser, seedDashboardDemoData, seedRiskManagementDemoData } from '../helpers/database';

/**
 * Full Demo: Risk Management
 *
 * This demo showcases the complete workflow for AI risk assessment and
 * mitigation action management in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - npx playwright test tests/demos/risk-management-demo.spec.ts (development - fast)
 * - DEMO_SPEED=slow npx playwright test tests/demos/risk-management-demo.spec.ts --headed (video recording)
 */

test.describe('Risk Management Module Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding dashboard demo data (AI systems)...');
    await seedDashboardDemoData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding risk management demo data (risks & mitigation actions)...');
    await seedRiskManagementDemoData('rachel.thompson@talenttech.eu');
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete risk management workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Risk Management Demo\n');

    // ==========================================
    // Scene 1: Login and Navigation
    // ==========================================
    console.log('📝 Step 1: Login to the application');
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.waitForTimeout(wait(2000));

    // Navigate to dashboard
    console.log('📊 Step 2: Navigate to dashboard');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to show some dashboard content
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 2: Navigate to Risk Management
    // ==========================================
    console.log('⚠️  Step 3: Navigate to Risk Management page');
    const navRiskMgmt = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the risk management page
    await expect(page.getByRole('heading', { name: 'Risk Management' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 3: Overview of Risk Registers
    // ==========================================
    console.log('📋 Step 4: View risk register cards');
    await page.waitForTimeout(wait(2500));

    // Show risk register cards with statistics
    // Risk registers should be visible as cards
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 4: View First Risk Register Details
    // ==========================================
    console.log('🔍 Step 5: View detailed risk assessment for Customer Service AI');

    // Click on "View Details" for first system
    const viewDetailsFirst = page.getByRole('link', { name: /View Details/i }).first();
    await smoothClick(page, viewDetailsFirst);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the risk register details page
    await expect(page.getByRole('heading', { name: 'Risk Register' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 5: Review High-Priority Risks
    // ==========================================
    console.log('🔴 Step 6: Review high-priority risks');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Look for HIGH risk badges
    await page.waitForTimeout(wait(3000));

    // Scroll to see bias risk
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 6: View Mitigation Actions
    // ==========================================
    console.log('✅ Step 7: View mitigation actions for high-priority risk');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    // View mitigation actions section
    await page.waitForTimeout(wait(3000));

    // Check for mitigation action statuses (IN_PROGRESS, PLANNED, COMPLETED)
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 7: Review Medium and Low Risks
    // ==========================================
    console.log('📊 Step 8: Scroll through medium and low priority risks');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Show MEDIUM risk
    await page.waitForTimeout(wait(2500));

    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Show LOW risk with ACCEPT decision
    await page.waitForTimeout(wait(2500));

    // ==========================================
    // Scene 8: View Second Risk Register
    // ==========================================
    console.log('🔐 Step 9: Navigate back and view Biometric Authentication System risks');
    await page.waitForTimeout(wait(1500));

    // Navigate back to risk management page
    const navRiskMgmt2 = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt2);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Click on second risk register
    const riskAssessmentLinks = await page.getByRole('link', { name: /View Details/i }).all();
    if (riskAssessmentLinks.length >= 2) {
      await smoothClick(page, riskAssessmentLinks[1]);
      await page.waitForLoadState('networkidle');
      await reEnableCursorTracking(page);
      await page.waitForTimeout(wait(3000));

      // Verify we're viewing another risk register
      await expect(page.getByRole('heading', { name: 'Risk Register' })).toBeVisible();
      await page.waitForTimeout(wait(2000));

      // Scroll to show safety and cybersecurity risks
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(3000));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2500));

      // Show mitigation actions
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(3000));
    }

    // ==========================================
    // Scene 9: Return to Risk Management Overview
    // ==========================================
    console.log('🏠 Step 10: Return to risk management overview');
    await page.waitForTimeout(wait(1500));

    // Navigate back to risk management page
    const navRiskMgmt3 = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt3);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to show all risk registers
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top for final overview
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(3000));

    console.log('✅ Risk Management Module Demo Complete');
  });
});

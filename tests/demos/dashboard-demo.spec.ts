import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking } from '../helpers/cursor-tracker';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser, seedDashboardDemoData } from '../helpers/database';

/**
 * Full Demo: Dashboard Overview
 *
 * This demo showcases the main dashboard with comprehensive data including
 * AI systems, risk classifications, gap assessments, incidents, and governance.
 *
 * Run with:
 * - npx playwright test tests/demos/dashboard-demo.spec.ts (development - fast)
 * - DEMO_SPEED=slow npx playwright test tests/demos/dashboard-demo.spec.ts --headed (video recording)
 */

test.describe('Dashboard Overview Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding dashboard demo data...');
    await seedDashboardDemoData('rachel.thompson@talenttech.eu');
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate dashboard overview with comprehensive data', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Dashboard Overview Demo\n');

    // ==========================================
    // Scene 1: Login and Initial Dashboard View
    // ==========================================
    console.log('📝 Step 1: Login to the application');
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.waitForTimeout(wait(2000));

    // Navigate to dashboard
    console.log('📊 Step 2: View dashboard overview');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(3000));

    // Verify welcome message
    await expect(page.getByTestId('dashboard-welcome-title')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 2: Stats Cards Overview
    // ==========================================
    console.log('📈 Step 3: Review key statistics');
    await page.waitForTimeout(wait(2000));

    // Stats cards should be visible with data
    // Total systems: 5, High risk: 2, Compliance score: ~82, Active incidents: 1
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 3: Risk Distribution Chart
    // ==========================================
    console.log('📊 Step 4: View risk distribution');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Verify risk distribution card
    await expect(page.getByTestId('dashboard-risk-distribution-card')).toBeVisible();
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 4: Recent Activity
    // ==========================================
    console.log('🔔 Step 5: Check recent activity');
    await page.waitForTimeout(wait(2000));

    // Recent activity card should show latest updates
    await expect(page.getByTestId('dashboard-recent-activity-card')).toBeVisible();
    await page.waitForTimeout(wait(2500));

    // ==========================================
    // Scene 5: Quick Actions
    // ==========================================
    console.log('⚡ Step 6: Review quick actions');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Quick actions card
    await expect(page.getByTestId('dashboard-quick-actions-card')).toBeVisible();
    await page.waitForTimeout(wait(3000));

    // Hover over each quick action to showcase them
    await page.getByTestId('dashboard-quick-action-add-system').hover();
    await page.waitForTimeout(wait(1000));

    await page.getByTestId('dashboard-quick-action-risk-assessment').hover();
    await page.waitForTimeout(wait(1000));

    await page.getByTestId('dashboard-quick-action-gap-analysis').hover();
    await page.waitForTimeout(wait(1000));

    await page.getByTestId('dashboard-quick-action-governance').hover();
    await page.waitForTimeout(wait(1000));

    await page.getByTestId('dashboard-quick-action-report-incident').hover();
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 6: Compliance Alerts - High Risk Systems
    // ==========================================
    console.log('⚠️  Step 7: View high-risk system alerts');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // High-risk systems alert should be visible
    const highRiskAlert = page.getByTestId('dashboard-compliance-alert');
    if (await highRiskAlert.isVisible()) {
      await page.waitForTimeout(wait(3000));

      // Hover over the review button
      await page.getByTestId('dashboard-review-high-risk-button').hover();
      await page.waitForTimeout(wait(1500));
    }

    // ==========================================
    // Scene 7: Incident Notification Alerts
    // ==========================================
    console.log('🚨 Step 8: Check incident notification requirements');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Authority notification alert
    const notificationAlert = page.getByTestId('dashboard-incident-notification-alert');
    if (await notificationAlert.isVisible()) {
      await page.waitForTimeout(wait(3000));

      // Hover over review button
      await page.getByTestId('dashboard-review-notifications-button').hover();
      await page.waitForTimeout(wait(1500));
    }

    // ==========================================
    // Scene 8: Critical Incidents Alert
    // ==========================================
    console.log('🔴 Step 9: Review critical incidents');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Critical incidents alert
    const criticalAlert = page.getByTestId('dashboard-critical-incidents-alert');
    if (await criticalAlert.isVisible()) {
      await page.waitForTimeout(wait(3000));

      // Hover over review button
      await page.getByTestId('dashboard-review-critical-incidents-button').hover();
      await page.waitForTimeout(wait(1500));
    }

    // ==========================================
    // Scene 9: Navigate to AI Systems
    // ==========================================
    console.log('🖥️  Step 10: Navigate to AI Systems overview');
    await page.waitForTimeout(wait(1500));

    // Click on AI Systems in navigation
    await page.getByTestId('nav-systems').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(3000));

    // Verify we see the AI systems we created
    await expect(page.getByText('Customer Service AI Assistant')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 10: Return to Dashboard
    // ==========================================
    console.log('🏠 Step 11: Return to dashboard');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(2000));

    // Scroll back to top for final view
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(3000));

    console.log('✅ Dashboard Overview Demo Complete');
  });
});

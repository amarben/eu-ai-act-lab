import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, reEnableCursorTracking, smoothClick, smoothType } from '../helpers/cursor-tracker';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser, seedIncidentDemoData } from '../helpers/database';

/**
 * Full Demo: Incident Management
 *
 * This demo showcases the complete workflow for managing serious incidents
 * in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - DEMO_SPEED=fast npx playwright test tests/demos/incidents-demo.spec.ts (development)
 * - DEMO_SPEED=slow npx playwright test tests/demos/incidents-demo.spec.ts --headed (video recording)
 */

test.describe('Incidents Module Demo', () => {
  test.setTimeout(timeout(900000)); // 15 minutes base timeout, scales with DEMO_SPEED

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding demo data...');
    await seedIncidentDemoData('rachel.thompson@talenttech.eu');
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete incident management workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Incident Management Demo\n');

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

    // Show dashboard with incident alerts
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(wait(2000));

    // Check if critical incidents alert is visible
    const criticalAlert = page.getByTestId('dashboard-critical-incidents-alert');
    if (await criticalAlert.isVisible()) {
      await page.waitForTimeout(wait(2000));
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 2: Navigate to Incidents List
    // ==========================================
    console.log('⚠️  Step 3: Navigate to Incidents page');
    const navIncidents = page.getByTestId('nav-incidents');
    await smoothClick(page, navIncidents);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify incident appears in list
    await expect(page.getByText('Critical Authentication System Failure')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 3: View Incident Details
    // ==========================================
    console.log('📋 Step 4: View incident details');
    const incidentLink = page.getByText('Critical Authentication System Failure').first();
    await smoothClick(page, incidentLink);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify incident details page
    await expect(page.getByText('INC-20260104-001')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Scroll to view incident details
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll to see severity and category
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(wait(2000));

    // Scroll to see impact assessment
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll to see response plan
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top to access action buttons
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 4: Authority Notification Assessment
    // ==========================================
    console.log('🔔 Step 5: Assess authority notification requirements');
    await page.waitForTimeout(wait(1500));

    // Click "Assess Notification" button
    await page.getByRole('button', { name: /Assess Notification/i }).click();
    await page.waitForTimeout(wait(3000));

    // Wait for dialog to open
    await expect(page.getByRole('heading', { name: 'Authority Notification Assessment' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Scroll to see all assessment criteria
    await page.evaluate(() => window.scrollBy(0, 100));
    await page.waitForTimeout(wait(500));

    // Mark as serious incident
    await page.getByLabel('This is a Serious Incident').check();
    await page.waitForTimeout(wait(1500));

    // Check health/safety impact
    await page.getByLabel('Impact on Health or Safety').check();
    await page.waitForTimeout(wait(1500));

    // Scroll to see the assessment result
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(wait(500));

    // Verify notification required indicator
    await expect(page.getByText('Authority Notification Required')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Fill in authority contact
    const authorityContact = page.getByLabel('Authority Contact Information');
    await smoothType(page, authorityContact, 'market.surveillance@euaiact.eu');
    await page.waitForTimeout(wait(500));

    // Scroll to submit button
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(wait(500));

    // Save assessment
    await page.getByRole('button', { name: 'Save Assessment' }).click();
    await page.waitForTimeout(wait(2000));

    // Verify assessment saved
    await page.waitForTimeout(wait(1500));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(500));

    // ==========================================
    // Scene 5: Add Action Items
    // ==========================================
    console.log('📝 Step 6: Add corrective action items');
    await page.waitForTimeout(wait(1500));

    // Click "Add Action Item" button
    await page.getByRole('button', { name: 'Add Action Item' }).click();
    await page.waitForTimeout(wait(3000));

    // Wait for dialog
    await expect(page.getByRole('heading', { name: 'Add Action Item' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Fill in action item description
    const actionDescription = page.getByLabel('Description *');
    await smoothType(page, actionDescription, 'Implement comprehensive monitoring system for database connections with automated alerts');
    await page.waitForTimeout(wait(500));

    // Fill in assigned to
    const actionAssignedTo = page.getByLabel('Assigned To *');
    await smoothType(page, actionAssignedTo, 'DevOps Team');

    // Set due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await page.getByLabel('Due Date').click();
    await page.waitForTimeout(wait(500));
    await page.getByLabel('Due Date').fill(dueDate.toISOString().split('T')[0]);
    await page.waitForTimeout(wait(500));

    // Scroll to submit button
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    // Submit
    await page.getByRole('button', { name: 'Add Action Item' }).click();
    await page.waitForTimeout(wait(2000));

    // Scroll to see the action item
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 6: Add Second Action Item
    // ==========================================
    await page.waitForTimeout(wait(1500));

    // Scroll back to top to find the "Add Action Item" button
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(500));

    // Click "Add Action Item" button again
    await page.getByRole('button', { name: 'Add Action Item' }).click();
    await page.waitForTimeout(wait(3000));

    // Fill in second action item
    const action2Description = page.getByLabel('Description *');
    await smoothType(page, action2Description, 'Review and retrain AI model with balanced dataset to reduce false positives');
    await page.waitForTimeout(wait(500));

    const action2AssignedTo = page.getByLabel('Assigned To *');
    await smoothType(page, action2AssignedTo, 'AI/ML Team');

    const dueDate2 = new Date();
    dueDate2.setDate(dueDate2.getDate() + 14);
    await page.getByLabel('Due Date').click();
    await page.waitForTimeout(wait(500));
    await page.getByLabel('Due Date').fill(dueDate2.toISOString().split('T')[0]);
    await page.waitForTimeout(wait(500));

    // Scroll to submit
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    await page.getByRole('button', { name: 'Add Action Item' }).click();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 7: Edit Action Item Status
    // ==========================================
    console.log('✏️  Step 7: Update action item status');
    await page.waitForTimeout(wait(1500));

    // Scroll to action items section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Find and click the first edit button
    await page.getByRole('button', { name: 'Edit action item' }).first().click();
    await page.waitForTimeout(wait(3000));

    // Wait for edit dialog
    await expect(page.getByRole('heading', { name: 'Edit Action Item' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // Update status to in progress
    await page.getByLabel('Status *').click();
    await page.waitForTimeout(wait(500));
    await page.getByRole('option', { name: /In Progress/i }).click();
    await page.waitForTimeout(wait(1500));

    // Scroll to save button
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 8: Review Incidents List
    // ==========================================
    console.log('📋 Step 8: Review incidents list');
    await page.waitForTimeout(wait(1500));

    // Click on "Incidents" in the navigation
    const navIncidents2 = page.getByTestId('nav-incidents');
    await smoothClick(page, navIncidents2);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify incident appears in list
    await expect(page.getByText('Critical Authentication System Failure')).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 9: Dashboard Alerts Overview
    // ==========================================
    console.log('📊 Step 9: View dashboard with incident alerts');
    await page.waitForTimeout(wait(1500));

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to see incident alerts
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(wait(2000));

    // Check for notification alert
    const notificationAlert = page.getByTestId('dashboard-incident-notification-alert');
    if (await notificationAlert.isVisible()) {
      await page.waitForTimeout(wait(2000));
    }

    // Check for critical incidents alert
    const criticalAlert2 = page.getByTestId('dashboard-critical-incidents-alert');
    if (await criticalAlert2.isVisible()) {
      await page.waitForTimeout(wait(2000));
    }

    // Final overview
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(3000));

    console.log('✅ Incidents Module Demo Complete');
  });
});

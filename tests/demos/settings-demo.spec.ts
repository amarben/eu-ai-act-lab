import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking } from '../helpers/cursor-tracker';
import { disconnectDatabase, seedAdminDemoUser } from '../helpers/database';

/**
 * Full Demo: Organization Settings
 *
 * This demo showcases the complete workflow for managing organization settings,
 * team members, and account preferences in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - npx playwright test tests/demos/settings-demo.spec.ts (development - fast)
 * - DEMO_SPEED=slow npx playwright test tests/demos/settings-demo.spec.ts --headed (video recording)
 */

test.describe('Organization Settings Module Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete organization settings workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Organization Settings Demo\n');

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
    await page.waitForTimeout(wait(3000));

    // Scroll to show some dashboard content
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 2: Navigate to Settings
    // ==========================================
    console.log('⚙️ Step 3: Navigate to Settings page');
    await page.click('[data-testid="nav-settings"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(3000));

    // Verify we're on the settings page
    await expect(page.locator('h1')).toContainText('Settings');
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 3: Organization Profile Tab
    // ==========================================
    console.log('🏢 Step 4: View Organization Profile');

    // Show the three tabs
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Organization Profile' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Team Management' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'My Account' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // View organization information
    await expect(page.locator('text=Organization Information')).toBeVisible();
    await page.waitForTimeout(wait(2500));

    // Scroll to show organization details
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 4: Edit Organization Profile
    // ==========================================
    console.log('✏️ Step 5: Edit organization information');

    // Click Edit Profile button
    const editButton = page.locator('button').filter({ hasText: 'Edit Profile' });
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(wait(2000));

      // Show the edit form
      await page.waitForTimeout(wait(2500));

      // Scroll to show all form fields
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(wait(2000));

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(wait(1500));

      // Cancel editing
      const cancelButton = page.locator('button').filter({ hasText: 'Cancel' });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(wait(1500));
      }
    }

    // ==========================================
    // Scene 5: Team Management Tab
    // ==========================================
    console.log('👥 Step 6: View Team Management');

    // Navigate to Team Management tab
    await page.locator('button[role="tab"]').filter({ hasText: 'Team Management' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(3000));

    // Show team members table
    await expect(page.locator('h3').filter({ hasText: 'Team Members' })).toBeVisible();
    await page.waitForTimeout(wait(2500));

    // Scroll to show team statistics
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll to show team members list
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2500));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    // ==========================================
    // Scene 6: Invite User Dialog (Preview)
    // ==========================================
    console.log('📧 Step 7: Preview user invitation dialog');

    // Click Invite User button if visible
    const inviteButton = page.locator('button').filter({ hasText: 'Invite User' });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      await page.waitForTimeout(wait(2500));

      // Show the invite form
      await page.waitForTimeout(wait(2000));

      // Close the dialog without sending invitation
      const closeButton = page.locator('button[aria-label="Close"]').or(page.locator('button').filter({ hasText: 'Cancel' }));
      if (await closeButton.first().isVisible()) {
        await closeButton.first().click();
        await page.waitForTimeout(wait(1500));
      } else {
        // Try pressing Escape if no close button found
        await page.keyboard.press('Escape');
        await page.waitForTimeout(wait(1500));
      }
    }

    // ==========================================
    // Scene 7: My Account Tab
    // ==========================================
    console.log('👤 Step 8: View My Account information');

    // Navigate to My Account tab
    await page.locator('button[role="tab"]').filter({ hasText: 'My Account' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(3000));

    // Show personal information
    await expect(page.locator('text=Personal Information')).toBeVisible();
    await page.waitForTimeout(wait(2500));

    // Scroll to show account details
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    // ==========================================
    // Scene 8: Return to Organization Profile
    // ==========================================
    console.log('🔙 Step 9: Return to Organization Profile');

    await page.locator('button[role="tab"]').filter({ hasText: 'Organization Profile' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(2500));

    // Final view of organization profile
    await expect(page.locator('text=Organization Information')).toBeVisible();
    await page.waitForTimeout(wait(3000));

    console.log('✅ Organization Settings Module Demo Complete');
  });
});

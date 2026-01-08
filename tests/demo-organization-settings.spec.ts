import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { login } from './helpers/auth';

/**
 * Organization & Profile Setup - Demo Video
 *
 * This test demonstrates all key features of the Organization & Profile Setup module:
 * - Navigating to Settings
 * - Viewing Organization Profile
 * - Editing Organization Information
 * - Managing Team Members
 * - Inviting New Users
 * - Viewing Account Information
 */

test.describe('Organization Settings - Demo', () => {
  let testOrgId: string;
  let adminUserId: string;
  let adminEmail: string;

  test.beforeAll(async () => {
    // Create demo organization
    const org = await prisma.organization.create({
      data: {
        name: 'Acme Technology Solutions',
        legalName: 'Acme Technology Solutions Ltd.',
        industry: 'TECHNOLOGY',
        size: 'MEDIUM',
        euPresence: true,
        headquarters: 'Brussels, Belgium',
        region: 'European Union',
        registrationNumber: 'BE987654321',
        description: 'Leading provider of AI-powered business solutions',
      },
    });
    testOrgId = org.id;

    // Create admin user
    adminEmail = `demo-admin-${Date.now()}@acme-tech.com`;
    const adminPassword = await hash('demo123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Sarah Johnson',
        passwordHash: adminPassword,
        role: 'ADMIN',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
    adminUserId = admin.id;

    // Create a regular team member
    const userPassword = await hash('user123', 10);
    await prisma.user.create({
      data: {
        email: `john.doe@acme-tech.com`,
        name: 'John Doe',
        passwordHash: userPassword,
        role: 'USER',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
  });

  test.afterAll(async () => {
    // Clean up demo data
    await prisma.user.deleteMany({
      where: { organizationId: testOrgId },
    });
    await prisma.organization.delete({
      where: { id: testOrgId },
    });
  });

  test('Complete Organization Settings Demonstration', async ({ page }) => {
    // Set timeout to 5 minutes for demo recording
    test.setTimeout(300000);

    // Get demo speed multiplier from environment
    const demoSpeed = process.env.DEMO_SPEED || 'normal';
    const speedMultipliers = { fast: 0.5, normal: 1, slow: 2 };
    const multiplier = speedMultipliers[demoSpeed as keyof typeof speedMultipliers] || 1;

    const wait = (ms: number) => page.waitForTimeout(ms * multiplier);

    // === STEP 1: Login and Navigate to Settings ===
    await login(page, { email: adminEmail, password: 'demo123' });
    await wait(1000);

    // Navigate to Settings page
    await page.click('[data-testid="nav-settings"]');
    await expect(page).toHaveURL('/dashboard/settings');
    await wait(1500);

    // === STEP 2: Organization Profile - View Mode ===
    await expect(page.locator('h1')).toContainText('Settings');
    await wait(1000);

    // Show the three tabs
    await expect(page.locator('button[role="tab"]', { hasText: 'Organization Profile' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: 'Team Management' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: 'My Account' })).toBeVisible();
    await wait(1500);

    // View organization information
    await expect(page.locator('text=Acme Technology Solutions').first()).toBeVisible();
    await expect(page.locator('text=Brussels, Belgium').first()).toBeVisible();
    await wait(2000);

    // === STEP 3: Edit Organization Profile ===
    await page.click('button:has-text("Edit Profile")');
    await wait(1000);

    // Edit the organization name
    const updatedName = `Acme Technology Solutions (Updated ${new Date().getFullYear()})`;
    await page.fill('input[id="name"]', updatedName);
    await wait(1500);

    // Save changes
    await page.click('button:has-text("Save Changes")');
    await wait(1000);

    // Verify the update
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${updatedName}`).first()).toBeVisible();
    await wait(2000);

    // === STEP 4: Team Management ===
    await page.click('button[role="tab"]:has-text("Team Management")');
    await expect(page.locator('h3:has-text("Team Members")')).toBeVisible({ timeout: 10000 });
    await wait(1500);

    // Show existing team members
    await expect(page.locator(`text=${adminEmail}`).first()).toBeVisible();
    await expect(page.locator('text=John Doe').first()).toBeVisible();
    await wait(2000);

    // Show team statistics
    await expect(page.locator('text=Team Statistics')).toBeVisible();
    await wait(1500);

    // === STEP 5: Invite a New User ===
    await page.click('button:has-text("Invite User")');
    await wait(1000);

    // Fill in new user details
    const newUserEmail = `maria.garcia@acme-tech.com`;
    await page.fill('input[id="invite-email"]', newUserEmail);
    await wait(800);
    await page.fill('input[id="invite-name"]', 'Maria Garcia');
    await wait(800);

    // Send invitation
    await page.click('button:has-text("Send Invitation")');
    await wait(1000);

    // Verify the new user appears in the table
    await expect(page.locator(`text=${newUserEmail}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Maria Garcia').first()).toBeVisible();
    await expect(page.locator('text=Pending').first()).toBeVisible();
    await wait(2000);

    // === STEP 6: My Account Tab ===
    await page.click('button[role="tab"]:has-text("My Account")');
    await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 10000 });
    await wait(1500);

    // Show personal information
    await expect(page.locator('text=Sarah Johnson').first()).toBeVisible();
    await expect(page.locator(`text=${adminEmail}`).first()).toBeVisible();
    await expect(page.locator('text=Administrator').first()).toBeVisible();
    await wait(2000);

    // === STEP 7: Return to Organization Profile ===
    await page.click('button[role="tab"]:has-text("Organization Profile")');
    await expect(page.locator('text=Organization Information')).toBeVisible({ timeout: 10000 });
    await wait(2000);

    // Clean up the invited user
    await prisma.user.delete({ where: { email: newUserEmail } });
  });
});

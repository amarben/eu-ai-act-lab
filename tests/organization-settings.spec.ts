import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { login } from './helpers/auth';

/**
 * Organization & Profile Setup Module - E2E Tests
 *
 * Tests cover:
 * - Settings page navigation and tabs
 * - Organization profile viewing and editing (admin only)
 * - Team management: invite, update role, remove users (admin only)
 * - User settings and account information
 * - Authorization checks for admin-only features
 */

test.describe('Organization & Profile Setup', () => {
  let testOrgId: string;
  let adminUserId: string;
  let regularUserId: string;
  let adminEmail: string;
  let regularUserEmail: string;

  test.beforeAll(async () => {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization for Settings',
        legalName: 'Test Org Legal Name',
        industry: 'TECHNOLOGY',
        size: 'MEDIUM',
        euPresence: true,
        headquarters: 'Brussels, Belgium',
        region: 'European Union',
        registrationNumber: 'BE123456789',
        description: 'A test organization for settings module testing',
      },
    });
    testOrgId = org.id;

    // Create admin user
    adminEmail = `admin-settings-${Date.now()}@test.com`;
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Settings Admin',
        passwordHash: adminPassword,
        role: 'ADMIN',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
    adminUserId = admin.id;

    // Create regular user
    regularUserEmail = `user-settings-${Date.now()}@test.com`;
    const userPassword = await hash('user123', 10);
    const user = await prisma.user.create({
      data: {
        email: regularUserEmail,
        name: 'Settings User',
        passwordHash: userPassword,
        role: 'USER',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
    regularUserId = user.id;
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { organizationId: testOrgId },
    });
    await prisma.organization.delete({
      where: { id: testOrgId },
    });
  });

  test.describe('Settings Page Navigation', () => {
    test('should navigate to settings page from sidebar', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });

      await page.click('[data-testid="nav-settings"]');

      await expect(page).toHaveURL('/dashboard/settings');
      await expect(page.locator('h1')).toContainText('Settings');
    });

    test('should display all three tabs', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('button[role="tab"]', { hasText: 'Organization Profile' })).toBeVisible();
      await expect(page.locator('button[role="tab"]', { hasText: 'Team Management' })).toBeVisible();
      await expect(page.locator('button[role="tab"]', { hasText: 'My Account' })).toBeVisible();
    });

    test('should switch between tabs', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      // Click Team Management tab and wait for content
      await page.click('button[role="tab"]:has-text("Team Management")');
      await expect(page.locator('h3:has-text("Team Members")')).toBeVisible({ timeout: 10000 });

      // Click My Account tab and wait for content
      await page.click('button[role="tab"]:has-text("My Account")');
      await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 10000 });

      // Click Organization Profile tab and wait for content
      await page.click('button[role="tab"]:has-text("Organization Profile")');
      await expect(page.locator('text=Organization Information')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Organization Profile - View Mode', () => {
    test('should display organization information correctly', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Test Organization for Settings').first()).toBeVisible();
      await expect(page.locator('text=Test Org Legal Name').first()).toBeVisible();
      await expect(page.locator('text=Technology').first()).toBeVisible();
      await expect(page.locator('text=Brussels, Belgium').first()).toBeVisible();
    });

    test('should show Edit Profile button for admins', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
    });

    test('should NOT show Edit Profile button for regular users', async ({ page }) => {
      await login(page, { email: regularUserEmail, password: 'user123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('button:has-text("Edit Profile")')).not.toBeVisible();
    });
  });

  test.describe('Organization Profile - Edit Mode', () => {
    test('should enter edit mode when clicking Edit Profile', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button:has-text("Edit Profile")');

      await expect(page.locator('input[id="name"]')).toBeVisible();
      await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    });

    test('should update organization name successfully', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button:has-text("Edit Profile")');

      const newName = `Updated Test Org ${Date.now()}`;
      await page.fill('input[id="name"]', newName);
      await page.click('button:has-text("Save Changes")');

      // Wait for the form to exit edit mode and verify the new name appears
      await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${newName}`).first()).toBeVisible();
    });
  });

  test.describe('Team Management', () => {
    test('should display team members table', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("Team Management")');
      await expect(page.locator('h3:has-text("Team Members")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${adminEmail}`).first()).toBeVisible();
      await expect(page.locator(`text=${regularUserEmail}`).first()).toBeVisible();
    });

    test('should show Invite User button for admins', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("Team Management")');
      await page.waitForTimeout(500);

      await expect(page.locator('button:has-text("Invite User")')).toBeVisible();
    });

    test('should NOT show Invite User button for regular users', async ({ page }) => {
      await login(page, { email: regularUserEmail, password: 'user123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("Team Management")');
      await page.waitForTimeout(500);

      await expect(page.locator('button:has-text("Invite User")')).not.toBeVisible();
    });

    test('should successfully invite a new user', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("Team Management")');
      await expect(page.locator('h3:has-text("Team Members")')).toBeVisible({ timeout: 10000 });

      await page.click('button:has-text("Invite User")');

      const newUserEmail = `invited-user-${Date.now()}@test.com`;
      await page.fill('input[id="invite-email"]', newUserEmail);
      await page.fill('input[id="invite-name"]', 'Invited Test User');

      await page.click('button:has-text("Send Invitation")');

      // Verify the user appears in the team members table
      await expect(page.locator(`text=${newUserEmail}`).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Invited Test User').first()).toBeVisible();
      await expect(page.locator('text=Pending').first()).toBeVisible();

      // Clean up
      await prisma.user.delete({ where: { email: newUserEmail } });
    });
  });

  test.describe('My Account Tab', () => {
    test('should display personal information', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("My Account")');
      await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${adminEmail}`).first()).toBeVisible();
      await expect(page.locator('text=Settings Admin').first()).toBeVisible();
      await expect(page.locator('text=Administrator').first()).toBeVisible();
    });

    test('should display account type correctly for regular user', async ({ page }) => {
      await login(page, { email: regularUserEmail, password: 'user123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      await page.click('button[role="tab"]:has-text("My Account")');
      await expect(page.locator('text=Standard User')).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${regularUserEmail}`).first()).toBeVisible();
    });
  });

  test.describe('Authorization Checks', () => {
    test('admin can edit organization profile', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      // Admin should see Edit Profile button
      await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
    });

    test('regular user cannot edit organization profile', async ({ page }) => {
      await login(page, { email: regularUserEmail, password: 'user123' });
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');

      // Regular user should NOT see Edit Profile button
      await expect(page.locator('button:has-text("Edit Profile")')).not.toBeVisible();
    });
  });
});

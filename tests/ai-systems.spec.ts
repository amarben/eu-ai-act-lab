import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { login } from './helpers/auth';

/**
 * AI Systems Module - E2E Tests
 *
 * Tests cover:
 * - AI Systems page navigation
 * - Empty state display
 * - Creating new AI systems
 * - Viewing AI systems list
 * - Search functionality
 * - System card information display
 * - System actions (view, edit)
 */

test.describe('AI Systems Module', () => {
  let testOrgId: string;
  let adminUserId: string;
  let adminEmail: string;

  test.beforeAll(async () => {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization for AI Systems',
        legalName: 'Test Org Legal Name',
        industry: 'TECHNOLOGY',
        size: 'MEDIUM',
        euPresence: true,
        headquarters: 'Brussels, Belgium',
        region: 'European Union',
        registrationNumber: 'BE123456789',
        description: 'A test organization for AI Systems module testing',
      },
    });
    testOrgId = org.id;

    // Create admin user
    adminEmail = `admin-aisystems-${Date.now()}@test.com`;
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'AI Systems Admin',
        passwordHash: adminPassword,
        role: 'ADMIN',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
    adminUserId = admin.id;
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.aISystem.deleteMany({
      where: { organizationId: testOrgId },
    });
    await prisma.user.deleteMany({
      where: { organizationId: testOrgId },
    });
    await prisma.organization.delete({
      where: { id: testOrgId },
    });
  });

  test.describe('Navigation & Empty State', () => {
    test('should navigate to AI Systems page from sidebar', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });

      await page.click('[data-testid="nav-systems"]');

      await expect(page).toHaveURL('/dashboard/systems');
      await expect(page.locator('h1')).toContainText('AI Systems');
    });

    test('should display empty state when no systems exist', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('[data-testid="empty-systems-card"]')).toBeVisible();
      await expect(page.locator('text=No AI Systems Yet')).toBeVisible();
      await expect(page.locator('[data-testid="add-first-system-button"]')).toBeVisible();
    });

    test('should show Add AI System button in header', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('[data-testid="add-system-button"]')).toBeVisible();
    });
  });

  test.describe('Create AI System', () => {
    test('should navigate to create system page when clicking Add AI System', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      await page.click('[data-testid="add-system-button"]');

      await expect(page).toHaveURL('/dashboard/systems/new');
      await expect(page.locator('h1')).toContainText('Add AI System');
    });

    test('should display system information form', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=System Information')).toBeVisible();
      await expect(page.locator('[data-testid="system-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-business-purpose-textarea"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-deployment-status-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-submit-button"]')).toBeVisible();
    });

    test('should show validation errors for required fields', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Submit without filling required fields
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation errors
      await expect(page.locator('text=Name must be at least 2 characters').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Business purpose must be at least 10 characters').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Select at least one user type').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Required').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Specify at least one type of data processed').first()).toBeVisible({ timeout: 5000 });
    });

    test('should successfully create a new AI system', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill in system name
      await page.fill('[data-testid="system-name-input"]', 'Customer Service Chatbot');

      // Fill in business purpose
      await page.fill('[data-testid="system-business-purpose-textarea"]', 'Automated customer support and query resolution');

      // Fill in description (optional)
      await page.fill('[data-testid="system-description-textarea"]', 'AI-powered chatbot for handling customer inquiries');

      // Fill in technical approach (optional)
      await page.fill('[data-testid="system-technical-approach-textarea"]', 'Natural Language Processing, Machine Learning');

      // Select primary users
      await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');
      await page.click('[data-testid="system-user-checkbox-EXTERNAL_CUSTOMERS"]');

      // Select deployment status
      await page.click('[data-testid="system-deployment-status-select"]');
      await page.getByRole('option', { name: 'PRODUCTION' }).click();

      // Add data processed (using DataCategory enum values)
      const dataInput = page.locator('[data-testid="system-data-processed-input"]');
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');
      await dataInput.fill('BEHAVIORAL_DATA');
      await dataInput.press('Enter');

      // Submit form
      await page.click('[data-testid="system-submit-button"]');

      // Should redirect to systems list
      await expect(page).toHaveURL('/dashboard/systems', { timeout: 10000 });

      // Verify system appears in the list
      await expect(page.locator('text=Customer Service Chatbot').first()).toBeVisible({ timeout: 10000 });
    });

    test('should cancel creation and return to dashboard', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      await page.click('[data-testid="system-cancel-button"]');

      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('View AI Systems List', () => {
    test.beforeEach(async () => {
      // Create test AI systems
      await prisma.aISystem.create({
        data: {
          name: 'Fraud Detection System',
          businessPurpose: 'Detect fraudulent transactions in real-time',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['FINANCIAL_DATA', 'BEHAVIORAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await prisma.aISystem.create({
        data: {
          name: 'Recommendation Engine',
          businessPurpose: 'Provide personalized product recommendations',
          primaryUsers: ['EXTERNAL_CUSTOMERS'],
          deploymentStatus: 'TESTING',
          dataCategories: ['BEHAVIORAL_DATA', 'PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });
    });

    test.afterEach(async () => {
      // Clean up test systems
      await prisma.aISystem.deleteMany({
        where: { organizationId: testOrgId },
      });
    });

    test('should display all AI systems in the list', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      // Should see both systems created in beforeEach
      await expect(page.locator('[data-testid="systems-grid"]')).toBeVisible();
      await expect(page.locator('text=Fraud Detection System').first()).toBeVisible();
      await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();
    });

    test('should display system card information correctly', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      // Check Fraud Detection System card
      const fraudCard = page.locator('[data-testid^="system-card-"]').filter({ hasText: 'Fraud Detection System' });
      await expect(fraudCard.locator('text=Fraud Detection System')).toBeVisible();
      await expect(fraudCard.locator('text=Detect fraudulent transactions in real-time')).toBeVisible();
      await expect(fraudCard.locator('text=PRODUCTION')).toBeVisible();
      await expect(fraudCard.locator('text=Not Classified')).toBeVisible();
      await expect(fraudCard.locator('text=Not Assessed')).toBeVisible();
    });

    test('should display View and Edit buttons on each system card', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      const systemCard = page.locator('[data-testid^="system-card-"]').first();
      await expect(systemCard.locator('text=View')).toBeVisible();
      await expect(systemCard.locator('text=Edit')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test.beforeEach(async () => {
      // Create test AI systems with different names
      await prisma.aISystem.create({
        data: {
          name: 'Invoice Processing AI',
          businessPurpose: 'Automate invoice processing',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['FINANCIAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await prisma.aISystem.create({
        data: {
          name: 'Sentiment Analysis Tool',
          businessPurpose: 'Analyze customer feedback sentiment',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });
    });

    test.afterEach(async () => {
      await prisma.aISystem.deleteMany({
        where: { organizationId: testOrgId },
      });
    });

    test('should filter systems by search query', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      // Search for "Invoice"
      await page.fill('[data-testid="systems-search-input"]', 'Invoice');

      // Should only show Invoice Processing AI
      await expect(page.locator('text=Invoice Processing AI').first()).toBeVisible();
      await expect(page.locator('text=Sentiment Analysis Tool')).not.toBeVisible();
    });

    test('should search by business purpose', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      // Search for "sentiment"
      await page.fill('[data-testid="systems-search-input"]', 'sentiment');

      // Should show Sentiment Analysis Tool
      await expect(page.locator('text=Sentiment Analysis Tool').first()).toBeVisible();
      await expect(page.locator('text=Invoice Processing AI')).not.toBeVisible();
    });

    test('should show no results message for non-matching search', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      await page.fill('[data-testid="systems-search-input"]', 'NonExistentSystem');

      await expect(page.locator('text=No AI systems found matching "NonExistentSystem"')).toBeVisible();
    });

    test('should clear search and show all systems', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems');
      await page.waitForLoadState('networkidle');

      // Search first
      await page.fill('[data-testid="systems-search-input"]', 'Invoice');
      await expect(page.locator('text=Sentiment Analysis Tool')).not.toBeVisible();

      // Clear search
      await page.fill('[data-testid="systems-search-input"]', '');

      // Should show all systems again
      await expect(page.locator('text=Invoice Processing AI').first()).toBeVisible();
      await expect(page.locator('text=Sentiment Analysis Tool').first()).toBeVisible();
    });
  });

  test.describe('Data Management', () => {
    test('should allow adding multiple data types in create form', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      const dataInput = page.locator('[data-testid="system-data-processed-input"]');

      // Add first data type
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');
      await expect(page.locator('text=PERSONAL_DATA')).toBeVisible();

      // Add second data type
      await dataInput.fill('FINANCIAL_DATA');
      await dataInput.press('Enter');
      await expect(page.locator('text=FINANCIAL_DATA')).toBeVisible();

      // Add third data type
      await dataInput.fill('BEHAVIORAL_DATA');
      await dataInput.press('Enter');
      await expect(page.locator('text=BEHAVIORAL_DATA')).toBeVisible();
    });

    test('should allow removing data types', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      const dataInput = page.locator('[data-testid="system-data-processed-input"]');

      // Add data types
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');
      await dataInput.fill('FINANCIAL_DATA');
      await dataInput.press('Enter');

      // Remove first data type
      await page.click('[data-testid="system-data-tag-remove-0"]');
      await expect(page.locator('text=PERSONAL_DATA')).not.toBeVisible();
      await expect(page.locator('text=FINANCIAL_DATA')).toBeVisible();
    });

    test('should not add duplicate data types', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      const dataInput = page.locator('[data-testid="system-data-processed-input"]');

      // Add data type
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');

      // Try to add same data type again
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');

      // Should only appear once
      await expect(page.locator('text=PERSONAL_DATA')).toHaveCount(1);
    });
  });

  test.describe('Form Validation', () => {
    test('should require system name', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill only business purpose
      await page.fill('[data-testid="system-business-purpose-textarea"]', 'Test purpose for validation');

      // Try to submit
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation error
      await expect(page.locator('text=Name must be at least 2 characters').first()).toBeVisible({ timeout: 5000 });
    });

    test('should require business purpose', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill only system name
      await page.fill('[data-testid="system-name-input"]', 'Test System');

      // Try to submit
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation error
      await expect(page.locator('text=Business purpose must be at least 10 characters').first()).toBeVisible({ timeout: 5000 });
    });

    test('should require at least one primary user', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill required text fields
      await page.fill('[data-testid="system-name-input"]', 'Test System');
      await page.fill('[data-testid="system-business-purpose-textarea"]', 'Test business purpose for validation');

      // Select deployment status
      await page.click('[data-testid="system-deployment-status-select"]');
      await page.getByRole('option', { name: 'PRODUCTION' }).click();

      // Add data processed
      const dataInput = page.locator('[data-testid="system-data-processed-input"]');
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');

      // Try to submit without selecting primary users
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation error
      await expect(page.locator('text=Select at least one user type').first()).toBeVisible({ timeout: 5000 });
    });

    test('should require deployment status', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill required text fields
      await page.fill('[data-testid="system-name-input"]', 'Test System');
      await page.fill('[data-testid="system-business-purpose-textarea"]', 'Test business purpose for validation');

      // Select primary user
      await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');

      // Add data processed
      const dataInput = page.locator('[data-testid="system-data-processed-input"]');
      await dataInput.fill('PERSONAL_DATA');
      await dataInput.press('Enter');

      // Try to submit without deployment status
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation error
      await expect(page.locator('text=Required').first()).toBeVisible({ timeout: 5000 });
    });

    test('should require at least one data type', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/systems/new');
      await page.waitForLoadState('networkidle');

      // Fill required text fields
      await page.fill('[data-testid="system-name-input"]', 'Test System');
      await page.fill('[data-testid="system-business-purpose-textarea"]', 'Test business purpose for validation');

      // Select primary user
      await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');

      // Select deployment status
      await page.click('[data-testid="system-deployment-status-select"]');
      await page.getByRole('option', { name: 'PRODUCTION' }).click();

      // Try to submit without data processed
      await page.click('[data-testid="system-submit-button"]');

      // Should show validation error
      await expect(page.locator('text=Specify at least one type of data processed').first()).toBeVisible({ timeout: 5000 });
    });
  });
});

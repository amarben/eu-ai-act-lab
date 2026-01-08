import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { login } from './helpers/auth';

/**
 * Risk Classification Module E2E Tests
 *
 * Tests the complete Risk Classification workflow including:
 * - Navigation and empty states
 * - Risk category overview cards
 * - Unclassified systems alert
 * - 5-step classification wizard
 * - Risk determination logic (PROHIBITED, HIGH_RISK, LIMITED_RISK, MINIMAL_RISK)
 * - Viewing classifications list
 */

test.describe('Risk Classification Module', () => {
  let testOrgId: string;
  let adminUserId: string;
  let adminEmail: string;

  test.beforeAll(async () => {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization for Risk Classification',
        legalName: 'Test Org Legal Name',
        industry: 'TECHNOLOGY',
        region: 'EU',
        size: 'MEDIUM',
        euPresence: true,
        headquarters: 'Brussels, Belgium',
        registrationNumber: 'BE123456789',
        description: 'Test organization for risk classification testing',
      },
    });
    testOrgId = org.id;

    // Create admin user
    adminEmail = `admin-riskcl-${Date.now()}@test.com`;
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Risk Classification Admin',
        passwordHash: adminPassword,
        role: 'ADMIN',
        organizationId: testOrgId,
        emailVerified: new Date(),
      },
    });
    adminUserId = admin.id;
  });

  test.afterAll(async () => {
    // Cleanup
    await prisma.riskClassification.deleteMany({ where: { aiSystem: { organizationId: testOrgId } } });
    await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.user.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.organization.delete({ where: { id: testOrgId } });
  });

  test.describe('Navigation & Empty State', () => {
    test('should navigate to Risk Classification page from sidebar', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });

      await page.click('text=Risk Classification');
      await expect(page).toHaveURL('/dashboard/classification');
    });

    test('should display empty state when no AI systems exist', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Should show empty state
      await expect(page.locator('text=No risk classifications yet')).toBeVisible();
      await expect(page.locator('text=You need to create an AI system first')).toBeVisible();
      await expect(page.locator('text=Create AI System')).toBeVisible();
    });

    test('should display empty state when AI systems exist but no classifications', async ({ page }) => {
      // Create an AI system first
      await prisma.aISystem.create({
        data: {
          name: 'Test System for Empty State',
          businessPurpose: 'Testing empty state display',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Should show empty state with different message
      await expect(page.locator('text=No risk classifications yet')).toBeVisible();
      await expect(page.locator('text=Start by classifying your AI systems')).toBeVisible();
      await expect(page.locator('text=Create First Classification')).toBeVisible();

      // Cleanup
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });
  });

  test.describe('Risk Overview Cards', () => {
    test.beforeEach(async () => {
      // Create test AI systems
      const system1 = await prisma.aISystem.create({
        data: {
          name: 'Prohibited System',
          businessPurpose: 'Social scoring system',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'PLANNING',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });

      const system2 = await prisma.aISystem.create({
        data: {
          name: 'High Risk System',
          businessPurpose: 'Employment screening',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });

      // Create classifications
      await prisma.riskClassification.create({
        data: {
          aiSystemId: system1.id,
          category: 'PROHIBITED',
          prohibitedPractices: ['Social scoring by public authorities'],
          highRiskCategories: [],
          interactsWithPersons: false,
          reasoning: 'This system performs social scoring which is prohibited under Article 5',
          applicableRequirements: ['Article 5'],
        },
      });

      await prisma.riskClassification.create({
        data: {
          aiSystemId: system2.id,
          category: 'HIGH_RISK',
          prohibitedPractices: [],
          highRiskCategories: ['Employment, workers management and access to self-employment'],
          interactsWithPersons: true,
          reasoning: 'This system is used for employment decisions, making it high-risk under Annex III',
          applicableRequirements: ['Annex III', 'Article 9'],
        },
      });
    });

    test.afterEach(async () => {
      await prisma.riskClassification.deleteMany({ where: { aiSystem: { organizationId: testOrgId } } });
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should display all 4 risk category overview cards', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Check all 4 risk category cards are displayed
      await expect(page.locator('text=Prohibited').first()).toBeVisible();
      await expect(page.locator('text=High Risk').first()).toBeVisible();
      await expect(page.locator('text=Limited Risk').first()).toBeVisible();
      await expect(page.locator('text=Minimal Risk').first()).toBeVisible();
    });

    test('should show correct counts in risk category cards', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Prohibited card should show 1
      const prohibitedCard = page.locator('text=Prohibited').locator('..').locator('..');
      await expect(prohibitedCard.locator('text=1').first()).toBeVisible();

      // High Risk card should show 1
      const highRiskCard = page.locator('text=High Risk').locator('..').locator('..');
      await expect(highRiskCard.locator('text=1').first()).toBeVisible();
    });
  });

  test.describe('Unclassified Systems Alert', () => {
    test.beforeEach(async () => {
      // Create unclassified AI system
      await prisma.aISystem.create({
        data: {
          name: 'Unclassified Chatbot',
          businessPurpose: 'Customer service automation',
          primaryUsers: ['EXTERNAL_CUSTOMERS'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });
    });

    test.afterEach(async () => {
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should display unclassified systems alert', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Unclassified Systems')).toBeVisible();
      await expect(page.locator('text=You have 1 AI system(s) that need risk classification')).toBeVisible();
      await expect(page.locator('text=Unclassified Chatbot')).toBeVisible();
      await expect(page.locator('text=Classify Now')).toBeVisible();
    });

    test('should navigate to classification wizard when clicking Classify Now', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      await page.click('text=Classify Now');
      await expect(page).toHaveURL(/\/dashboard\/classification\/new\?systemId=/);
    });
  });

  test.describe('Classification Wizard - Complete Flow', () => {
    let testSystemId: string;

    test.beforeEach(async () => {
      // Create AI system for classification
      const system = await prisma.aISystem.create({
        data: {
          name: 'Recommendation Engine',
          businessPurpose: 'Personalized product recommendations based on user behavior',
          primaryUsers: ['EXTERNAL_CUSTOMERS'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
          organizationId: testOrgId,
        },
      });
      testSystemId = system.id;
    });

    test.afterEach(async () => {
      await prisma.riskClassification.deleteMany({ where: { aiSystem: { organizationId: testOrgId } } });
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should complete MINIMAL_RISK classification wizard', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Step 1: Select AI System
      await expect(page.locator('text=Step 1: Select AI System')).toBeVisible();
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Recommendation Engine/ }).click();

      // Verify system information is displayed
      await expect(page.locator('text=Personalized product recommendations')).toBeVisible();

      // Next to Step 2
      await page.click('[data-testid="classification-step1-next"]');

      // Step 2: Prohibited Practices (select none)
      await expect(page.locator('text=Step 2: Prohibited Practices')).toBeVisible();
      await expect(page.locator('text=Subliminal manipulation')).toBeVisible();

      // Next to Step 3
      await page.click('[data-testid="classification-step2-next"]');

      // Step 3: High-Risk Categories (select none)
      await expect(page.locator('text=Step 3: High-Risk Categories')).toBeVisible();
      await expect(page.locator('text=Biometric identification')).toBeVisible();

      // Next to Step 4
      await page.click('[data-testid="classification-step3-next"]');

      // Step 4: Additional Questions
      await expect(page.locator('text=Step 4: Additional Questions')).toBeVisible();

      // Don't check interacts with persons (MINIMAL_RISK)
      await page.fill(
        '[data-testid="classification-reasoning-textarea"]',
        'This is a standard recommendation engine that provides product suggestions. It does not fall under prohibited practices or high-risk categories.'
      );
      await page.fill(
        '[data-testid="classification-requirements-textarea"]',
        'No specific EU AI Act requirements apply'
      );

      // Next to Step 5
      await page.click('[data-testid="classification-step4-next"]');

      // Step 5: Review
      await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();
      await expect(page.locator('text=Minimal Risk AI System')).toBeVisible();
      await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();

      // Submit
      await page.click('[data-testid="classification-submit-button"]');

      // Should redirect to classifications list
      await expect(page).toHaveURL('/dashboard/classification', { timeout: 10000 });

      // Verify classification appears in list
      await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();
      await expect(page.locator('text=Minimal Risk').first()).toBeVisible();
    });

    test('should complete LIMITED_RISK classification (interacts with persons)', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Step 1
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Recommendation Engine/ }).click();
      await page.click('[data-testid="classification-step1-next"]');

      // Step 2 (no prohibited practices)
      await page.click('[data-testid="classification-step2-next"]');

      // Step 3 (no high-risk categories)
      await page.click('[data-testid="classification-step3-next"]');

      // Step 4: Check interacts with persons
      await page.click('[data-testid="classification-interacts-checkbox"]');
      await page.fill(
        '[data-testid="classification-reasoning-textarea"]',
        'This recommendation engine directly interacts with customers by providing personalized suggestions, requiring transparency obligations.'
      );
      await page.fill('[data-testid="classification-requirements-textarea"]', 'Article 52 - Transparency obligations');
      await page.click('[data-testid="classification-step4-next"]');

      // Step 5: Verify LIMITED_RISK
      await expect(page.locator('text=Limited Risk AI System')).toBeVisible();
      await expect(page.locator('text=transparency obligations').first()).toBeVisible();

      await page.click('[data-testid="classification-submit-button"]');
      await expect(page).toHaveURL('/dashboard/classification', { timeout: 10000 });
    });

    test('should complete HIGH_RISK classification', async ({ page }) => {
      // Create employment-related system
      const employmentSystem = await prisma.aISystem.create({
        data: {
          name: 'Hiring Assessment AI',
          businessPurpose: 'Automated candidate screening and ranking',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'TESTING',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Step 1
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Hiring Assessment AI/ }).click();
      await page.click('[data-testid="classification-step1-next"]');

      // Step 2 (no prohibited practices)
      await page.click('[data-testid="classification-step2-next"]');

      // Step 3: Select high-risk category
      await page.click('[data-testid="classification-highrisk-checkbox-employment-workers-management-and-access-to-self-employment"]');
      await page.click('[data-testid="classification-step3-next"]');

      // Step 4
      await page.click('[data-testid="classification-interacts-checkbox"]');
      await page.fill(
        '[data-testid="classification-reasoning-textarea"]',
        'This system automates hiring decisions, making it high-risk under Annex III of the EU AI Act. It requires strict compliance including conformity assessment.'
      );
      await page.fill('[data-testid="classification-requirements-textarea"]', 'Annex III, Article 9, Article 13, Article 14');
      await page.click('[data-testid="classification-step4-next"]');

      // Step 5: Verify HIGH_RISK
      await expect(page.locator('text=High-Risk AI System')).toBeVisible();
      await expect(page.locator('text=strict compliance').first()).toBeVisible();

      await page.click('[data-testid="classification-submit-button"]');
      await expect(page).toHaveURL('/dashboard/classification', { timeout: 10000 });

      // Cleanup
      await prisma.aISystem.delete({ where: { id: employmentSystem.id } });
    });

    test('should complete PROHIBITED classification', async ({ page }) => {
      // Create social scoring system
      const prohibitedSystem = await prisma.aISystem.create({
        data: {
          name: 'Social Credit System',
          businessPurpose: 'Citizen behavior scoring',
          primaryUsers: ['PUBLIC'],
          deploymentStatus: 'PLANNING',
          dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Step 1
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Social Credit System/ }).click();
      await page.click('[data-testid="classification-step1-next"]');

      // Step 2: Select prohibited practice
      await page.click('[data-testid="classification-prohibited-checkbox-social-scoring-by-public-authorities"]');
      await page.click('[data-testid="classification-step2-next"]');

      // Step 3
      await page.click('[data-testid="classification-step3-next"]');

      // Step 4
      await page.fill(
        '[data-testid="classification-reasoning-textarea"]',
        'This system performs social scoring by public authorities, which is explicitly prohibited under Article 5 of the EU AI Act. Such systems must not be deployed.'
      );
      await page.fill('[data-testid="classification-requirements-textarea"]', 'Article 5 - Prohibited practices');
      await page.click('[data-testid="classification-step4-next"]');

      // Step 5: Verify PROHIBITED
      await expect(page.locator('text=Prohibited AI Practice')).toBeVisible();
      await expect(page.locator('text=must not be deployed').first()).toBeVisible();

      await page.click('[data-testid="classification-submit-button"]');
      await expect(page).toHaveURL('/dashboard/classification', { timeout: 10000 });

      // Cleanup
      await prisma.aISystem.delete({ where: { id: prohibitedSystem.id } });
    });
  });

  test.describe('Wizard Navigation', () => {
    let testSystemId: string;

    test.beforeEach(async () => {
      const system = await prisma.aISystem.create({
        data: {
          name: 'Test Navigation System',
          businessPurpose: 'Testing navigation',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });
      testSystemId = system.id;
    });

    test.afterEach(async () => {
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should navigate forward through all steps', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Select system
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Test Navigation System/ }).click();

      // Navigate through steps
      await expect(page.locator('text=Step 1: Select AI System')).toBeVisible();
      await page.click('[data-testid="classification-step1-next"]');

      await expect(page.locator('text=Step 2: Prohibited Practices')).toBeVisible();
      await page.click('[data-testid="classification-step2-next"]');

      await expect(page.locator('text=Step 3: High-Risk Categories')).toBeVisible();
      await page.click('[data-testid="classification-step3-next"]');

      await expect(page.locator('text=Step 4: Additional Questions')).toBeVisible();
      await page.fill('[data-testid="classification-reasoning-textarea"]', 'Test reasoning for navigation flow through wizard steps');
      await page.click('[data-testid="classification-step4-next"]');

      await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();
    });

    test('should navigate backward through all steps', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Select system and navigate to step 5
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Test Navigation System/ }).click();
      await page.click('[data-testid="classification-step1-next"]');
      await page.click('[data-testid="classification-step2-next"]');
      await page.click('[data-testid="classification-step3-next"]');
      await page.fill('[data-testid="classification-reasoning-textarea"]', 'Test reasoning for backward navigation');
      await page.click('[data-testid="classification-step4-next"]');

      await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();

      // Navigate backward
      await page.click('[data-testid="classification-step5-back"]');
      await expect(page.locator('text=Step 4: Additional Questions')).toBeVisible();

      await page.click('[data-testid="classification-step4-back"]');
      await expect(page.locator('text=Step 3: High-Risk Categories')).toBeVisible();

      await page.click('[data-testid="classification-step3-back"]');
      await expect(page.locator('text=Step 2: Prohibited Practices')).toBeVisible();

      await page.click('[data-testid="classification-step2-back"]');
      await expect(page.locator('text=Step 1: Select AI System')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    let testSystemId: string;

    test.beforeEach(async () => {
      const system = await prisma.aISystem.create({
        data: {
          name: 'Validation Test System',
          businessPurpose: 'Testing form validation',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });
      testSystemId = system.id;
    });

    test.afterEach(async () => {
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should require AI system selection in step 1', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Next button should be disabled when no system selected
      const nextButton = page.locator('[data-testid="classification-step1-next"]');
      await expect(nextButton).toBeDisabled();
    });

    test('should require minimum reasoning length', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification/new');
      await page.waitForLoadState('networkidle');

      // Navigate to step 4
      await page.click('[data-testid="classification-system-select"]');
      await page.getByRole('option', { name: /Validation Test System/ }).click();
      await page.click('[data-testid="classification-step1-next"]');
      await page.click('[data-testid="classification-step2-next"]');
      await page.click('[data-testid="classification-step3-next"]');

      // Try short reasoning (less than 50 characters)
      await page.fill('[data-testid="classification-reasoning-textarea"]', 'Too short');

      // Wait a moment for validation to process
      await page.waitForTimeout(500);

      // Try to proceed to next step - should work (validation happens on submit, not step navigation)
      await page.click('[data-testid="classification-step4-next"]');
      await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();

      // Try to submit the form with invalid data
      await page.click('[data-testid="classification-submit-button"]');

      // Wait a moment for any potential validation/submission
      await page.waitForTimeout(1000);

      // Should stay on the new page (validation should prevent submission)
      await expect(page).toHaveURL('/dashboard/classification/new', { timeout: 5000 });

      // Verify we're still on Step 5 (form didn't submit)
      await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();
    });
  });

  test.describe('View Classifications List', () => {
    test.beforeEach(async () => {
      // Create multiple systems with classifications
      const system1 = await prisma.aISystem.create({
        data: {
          name: 'Healthcare Diagnostic AI',
          businessPurpose: 'Medical diagnosis assistance',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['HEALTH_DATA'],
          organizationId: testOrgId,
        },
      });

      const system2 = await prisma.aISystem.create({
        data: {
          name: 'Simple Chatbot',
          businessPurpose: 'Basic FAQ responses',
          primaryUsers: ['EXTERNAL_CUSTOMERS'],
          deploymentStatus: 'PRODUCTION',
          dataCategories: ['NO_PERSONAL_DATA'],
          organizationId: testOrgId,
        },
      });

      await prisma.riskClassification.create({
        data: {
          aiSystemId: system1.id,
          category: 'HIGH_RISK',
          prohibitedPractices: [],
          highRiskCategories: ['Access to essential private and public services'],
          interactsWithPersons: true,
          reasoning: 'Medical diagnosis systems are high-risk due to potential health impact',
          applicableRequirements: ['Annex III', 'Article 9', 'Article 13'],
        },
      });

      await prisma.riskClassification.create({
        data: {
          aiSystemId: system2.id,
          category: 'MINIMAL_RISK',
          prohibitedPractices: [],
          highRiskCategories: [],
          interactsWithPersons: false,
          reasoning: 'Simple FAQ chatbot with no personal data processing has minimal risk',
          applicableRequirements: [],
        },
      });
    });

    test.afterEach(async () => {
      await prisma.riskClassification.deleteMany({ where: { aiSystem: { organizationId: testOrgId } } });
      await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    });

    test('should display all classifications in the list', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Should show both classifications
      await expect(page.locator('text=Healthcare Diagnostic AI').first()).toBeVisible();
      await expect(page.locator('text=Simple Chatbot').first()).toBeVisible();
    });

    test('should display risk badges correctly', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Check risk badges
      await expect(page.locator('text=High Risk').first()).toBeVisible();
      await expect(page.locator('text=Minimal Risk').first()).toBeVisible();
    });

    test('should display classification details', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Check details are shown
      await expect(page.locator('text=Medical diagnosis systems are high-risk')).toBeVisible();
      await expect(page.locator('text=Interacts with Persons')).toBeVisible();
      await expect(page.locator('text=Applicable Requirements: Annex III, Article 9, Article 13')).toBeVisible();
    });

    test('should have View Details button for each classification', async ({ page }) => {
      await login(page, { email: adminEmail, password: 'admin123' });
      await page.goto('/dashboard/classification');
      await page.waitForLoadState('networkidle');

      // Should have View Details buttons
      const viewButtons = page.locator('text=View Details');
      await expect(viewButtons.first()).toBeVisible();
      await expect(viewButtons).toHaveCount(2);
    });
  });
});

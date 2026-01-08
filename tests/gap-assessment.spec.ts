import { test, expect, Page } from '@playwright/test';
import { seedTestUser, createTestAISystem, createTestRiskClassification, cleanupTestData } from './helpers/database';
import { login, TestUser } from './helpers/auth';

/**
 * Gap Assessment Module E2E Tests
 *
 * Core functionality tests for Gap Assessment feature:
 * - System selection and navigation
 * - Gap assessment workflow
 * - Requirements assessment and scoring
 * - Assessment persistence
 */

/**
 * Helper function to select an option from a shadcn/ui Select component using keyboard navigation
 * @param page - Playwright page object
 * @param testId - The test ID of the select button
 * @param steps - Number of ArrowDown presses to reach the desired option (0 = first option)
 */
async function selectDropdownOption(page: Page, testId: string, steps: number = 0) {
  // Click the select button to open dropdown
  await page.click(`[data-testid="${testId}"]`);

  // Wait for dropdown portal to render
  await page.waitForTimeout(500);

  // Navigate to the desired option using keyboard
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
  }

  // Select the option
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

test.describe('Gap Assessment Module', () => {
  let userId: string;
  let organizationId: string;
  let highRiskSystemId: string;
  let minimalRiskSystemId: string;
  let testUser: TestUser;

  test.beforeAll(async () => {
    // Create test user and organization
    const user = await seedTestUser();
    userId = user.id;
    organizationId = user.organizationId;
    testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
    };

    // Create HIGH_RISK AI system
    const highRiskSystem = await createTestAISystem(organizationId, {
      name: 'AI Recruitment Assistant',
      businessPurpose: 'Automated resume screening and candidate ranking for employment decisions',
      primaryUsers: ['INTERNAL_EMPLOYEES', 'PUBLIC'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA', 'SENSITIVE_DATA'],
    });
    highRiskSystemId = highRiskSystem.id;

    // Create HIGH_RISK classification
    await createTestRiskClassification(highRiskSystemId, {
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Employment, workers management and access to self-employment'],
      interactsWithPersons: true,
      reasoning: 'High-risk system used for employment decisions requiring strict EU AI Act compliance.',
      applicableRequirements: [
        'Article 9 - Risk Management',
        'Article 10 - Data Governance',
        'Article 11 - Technical Documentation',
      ],
    });

    // Create MINIMAL_RISK system (should not appear in gap assessment)
    const minimalRiskSystem = await createTestAISystem(organizationId, {
      name: 'Simple Chatbot',
      businessPurpose: 'Basic FAQ responses',
      primaryUsers: ['EXTERNAL_CUSTOMERS'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA'],
    });
    minimalRiskSystemId = minimalRiskSystem.id;

    await createTestRiskClassification(minimalRiskSystemId, {
      category: 'MINIMAL_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: 'Simple chatbot with minimal risk',
      applicableRequirements: ['Voluntary codes of conduct'],
    });
  });

  test.afterAll(async () => {
    await cleanupTestData(organizationId);
  });

  test.describe('Navigation & System Selection', () => {
    test('should navigate to Gap Assessment page from sidebar', async ({ page }) => {
      await login(page, testUser);
      await page.waitForLoadState('networkidle');

      await page.click('text=Gap Assessment');
      await expect(page).toHaveURL('/dashboard/gap-assessment');

      // Should show page heading
      await expect(page.locator('h1:has-text("Gap Assessment")')).toBeVisible();
    });

    test('should display system selection dropdown with only HIGH_RISK systems', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/gap-assessment');
      await page.waitForLoadState('networkidle');

      // Click system select dropdown
      await page.click('[data-testid="gap-assessment-system-select"]');
      await page.waitForTimeout(500); // Wait for dropdown portal to render

      // Should show HIGH_RISK system (use .first() to handle potential duplicates)
      await expect(page.getByRole('option', { name: /AI Recruitment Assistant/ }).first()).toBeVisible();

      // Should NOT show MINIMAL_RISK system
      await expect(page.getByRole('option', { name: /Simple Chatbot/ })).not.toBeVisible();
    });

    test('should enable Next button when system is selected', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/gap-assessment');
      await page.waitForLoadState('networkidle');

      // Next button should be disabled initially
      const nextButton = page.getByTestId('gap-assessment-next-step');
      await expect(nextButton).toBeDisabled();

      // Select system using keyboard navigation
      await selectDropdownOption(page, 'gap-assessment-system-select', 0);

      // Next button should now be enabled
      await expect(nextButton).toBeEnabled();
    });
  });

  test.describe('Gap Assessment Wizard', () => {
    test('should complete basic gap assessment workflow', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/gap-assessment');
      await page.waitForLoadState('networkidle');

      // Step 1: Select system using keyboard navigation
      await selectDropdownOption(page, 'gap-assessment-system-select', 0);
      await page.click('[data-testid="gap-assessment-next-step"]');
      await page.waitForLoadState('networkidle');

      // Step 2: Should show assessment form with Risk Management category tab
      await expect(page.getByTestId('gap-assessment-category-risk_management')).toBeVisible();

      // Should show first requirement
      const firstRequirement = page.getByTestId('gap-assessment-requirement-0');
      await expect(firstRequirement).toBeVisible();

      // Update first requirement status to IMPLEMENTED (0=NOT_STARTED, 1=IN_PROGRESS, 2=IMPLEMENTED)
      await selectDropdownOption(page, 'gap-assessment-requirement-0-status', 2);
      await page.waitForTimeout(500);

      // Submit assessment
      const submitButton = page.getByTestId('gap-assessment-submit-button');
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      // Should redirect to assessment details or list page
      await page.waitForURL(/.*\/dashboard\/gap-assessment.*/);
      await page.waitForLoadState('networkidle');
    });

    test('should navigate through category tabs', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/gap-assessment');
      await page.waitForLoadState('networkidle');

      // Start assessment using keyboard navigation
      await selectDropdownOption(page, 'gap-assessment-system-select', 0);
      await page.click('[data-testid="gap-assessment-next-step"]');
      await page.waitForLoadState('networkidle');

      // Test category tabs
      const categories = ['risk_management', 'data_governance', 'technical_documentation'];

      for (const category of categories) {
        const categoryTab = page.getByTestId(`gap-assessment-category-${category}`);
        await categoryTab.click();
        await page.waitForTimeout(300);

        // Verify requirements are visible
        const firstRequirement = page.getByTestId('gap-assessment-requirement-0');
        await expect(firstRequirement).toBeVisible();
      }
    });

    test('should update requirement status and persist data', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/gap-assessment');
      await page.waitForLoadState('networkidle');

      // Start assessment using keyboard navigation
      await selectDropdownOption(page, 'gap-assessment-system-select', 0);
      await page.click('[data-testid="gap-assessment-next-step"]');
      await page.waitForLoadState('networkidle');

      // Fill in requirement details - set status to IMPLEMENTED (0=NOT_STARTED, 1=IN_PROGRESS, 2=IMPLEMENTED)
      await selectDropdownOption(page, 'gap-assessment-requirement-0-status', 2);
      await page.waitForTimeout(300);

      const assignedInput = page.getByTestId('gap-assessment-requirement-0-assigned');
      await assignedInput.fill('John Doe - CTO');
      await page.waitForTimeout(300);

      const notesInput = page.getByTestId('gap-assessment-requirement-0-notes');
      await notesInput.fill('Risk management framework implemented using ISO 31000');
      await page.waitForTimeout(300);

      // Navigate to another tab
      const dataGovTab = page.getByTestId('gap-assessment-category-data_governance');
      await dataGovTab.click();
      await page.waitForTimeout(300);

      // Navigate back to risk management
      const riskMgmtTab = page.getByTestId('gap-assessment-category-risk_management');
      await riskMgmtTab.click();
      await page.waitForTimeout(300);

      // Verify data persisted
      const assignedValue = await assignedInput.inputValue();
      const notesValue = await notesInput.inputValue();

      expect(assignedValue).toBe('John Doe - CTO');
      expect(notesValue).toContain('Risk management framework');
    });
  });
});

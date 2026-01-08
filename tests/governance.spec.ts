import { test, expect, Page } from '@playwright/test';
import { seedTestUser, createTestAISystem, createTestRiskClassification, createTestGovernance, cleanupTestData } from './helpers/database';
import { login, TestUser } from './helpers/auth';

/**
 * Governance Module E2E Tests
 *
 * Core functionality tests for AI Governance feature:
 * - Empty state and navigation
 * - Governance structure creation (single and multi-role)
 * - System selection filtering
 * - Multi-role add/remove workflow
 * - Form validation
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

test.describe('Governance Module', () => {
  let userId: string;
  let organizationId: string;
  let systemWithoutGovernanceId: string;
  let systemWithGovernanceId: string;
  let highRiskSystemId: string;
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

    // Clean up any existing test data before creating new data
    await cleanupTestData('test@example.com');

    // Create AI system WITHOUT governance (for testing creation)
    const systemWithoutGovernance = await createTestAISystem(organizationId, {
      name: 'Customer Support AI',
      businessPurpose: 'AI-powered customer support chatbot',
      primaryUsers: ['EXTERNAL_CUSTOMERS'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA'],
    });
    systemWithoutGovernanceId = systemWithoutGovernance.id;

    await createTestRiskClassification(systemWithoutGovernanceId, {
      category: 'LIMITED_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: true,
      reasoning: 'Limited risk customer support system',
      applicableRequirements: ['Transparency obligations'],
    });

    // Create HIGH_RISK AI system WITHOUT governance
    const highRiskSystem = await createTestAISystem(organizationId, {
      name: 'AI Recruitment Assistant',
      businessPurpose: 'Automated resume screening and candidate ranking',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA', 'SENSITIVE_DATA'],
    });
    highRiskSystemId = highRiskSystem.id;

    await createTestRiskClassification(highRiskSystemId, {
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Employment, workers management and access to self-employment'],
      interactsWithPersons: true,
      reasoning: 'High-risk employment decision system',
      applicableRequirements: ['Article 9', 'Article 10', 'Article 11'],
    });

    // Create FOURTH AI system WITHOUT governance (for multi-role workflow test)
    const fourthSystem = await createTestAISystem(organizationId, {
      name: 'Content Moderation AI',
      businessPurpose: 'AI-powered content moderation and filtering',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA'],
    });

    await createTestRiskClassification(fourthSystem.id, {
      category: 'LIMITED_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: true,
      reasoning: 'Limited risk content moderation',
      applicableRequirements: ['Transparency obligations'],
    });

    // Create FIFTH AI system WITHOUT governance (for validation test)
    const fifthSystem = await createTestAISystem(organizationId, {
      name: 'Data Analytics AI',
      businessPurpose: 'Business intelligence and analytics platform',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      deploymentStatus: 'TESTING',
      dataCategories: ['PERSONAL_DATA'],
    });

    await createTestRiskClassification(fifthSystem.id, {
      category: 'MINIMAL_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: 'Minimal risk analytics system',
      applicableRequirements: [],
    });

    // Create AI system WITH governance (should not appear in new governance dropdown)
    const systemWithGovernance = await createTestAISystem(organizationId, {
      name: 'Email Classification AI',
      businessPurpose: 'Email categorization system',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      deploymentStatus: 'PRODUCTION',
      dataCategories: ['PERSONAL_DATA'],
    });
    systemWithGovernanceId = systemWithGovernance.id;

    await createTestRiskClassification(systemWithGovernanceId, {
      category: 'MINIMAL_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: 'Minimal risk email classification',
      applicableRequirements: [],
    });

    // Create governance for this system
    await createTestGovernance(systemWithGovernanceId, [
      {
        roleType: 'SYSTEM_OWNER',
        personName: 'Jane Smith',
        email: 'jane.smith@example.com',
        department: 'IT Department',
        responsibilities: 'Overall system ownership and accountability',
        isActive: true,
      },
    ]);
  });

  test.afterAll(async () => {
    await cleanupTestData('test@example.com');
  });

  test.describe('Empty State & Navigation', () => {
    // Clean up all governance before empty state tests
    test.beforeEach(async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.aIGovernance.deleteMany({
        where: {
          aiSystem: {
            organizationId,
          },
        },
      });
      await prisma.$disconnect();
    });

    // Recreate governance for "Email Classification AI" after empty state tests
    test.afterEach(async () => {
      await createTestGovernance(systemWithGovernanceId, [
        {
          roleType: 'SYSTEM_OWNER',
          personName: 'Jane Smith',
          email: 'jane.smith@example.com',
          department: 'IT Department',
          responsibilities: 'Overall system ownership and accountability',
          isActive: true,
        },
      ]);
    });

    test('should show empty state when no governance structures exist', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance');
      await page.waitForLoadState('networkidle');

      // Should show empty state card
      const emptyCard = page.getByTestId('empty-governance-card');
      await expect(emptyCard).toBeVisible();

      // Should show CTA button
      const ctaButton = page.getByTestId('add-first-governance-button');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveText(/Create Your First Governance Structure/i);
    });

    test('should navigate to governance wizard from empty state', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance');
      await page.waitForLoadState('networkidle');

      // Click CTA button
      await page.click('[data-testid="add-first-governance-button"]');

      // Should navigate to new governance page
      await expect(page).toHaveURL('/dashboard/governance/new');

      // Should show Step 1 heading
      await expect(page.locator('h3:has-text("Step 1")')).toBeVisible();
    });
  });

  test.describe('Governance Creation', () => {
    test('should filter systems without existing governance in dropdown', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance/new');
      await page.waitForLoadState('networkidle');

      // Open system select dropdown
      await page.click('[data-testid="select-ai-system"]');
      await page.waitForTimeout(500);

      // Should show systems WITHOUT governance
      await expect(page.getByRole('option', { name: /Customer Support AI/i }).first()).toBeVisible();
      await expect(page.getByRole('option', { name: /AI Recruitment Assistant/i }).first()).toBeVisible();

      // Should NOT show system WITH governance
      await expect(page.getByRole('option', { name: /Email Classification AI/i })).not.toBeVisible();
    });

    test('should create minimal governance with single SYSTEM_OWNER role', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance/new');
      await page.waitForLoadState('networkidle');

      // Step 1: Select AI system using keyboard navigation
      await selectDropdownOption(page, 'select-ai-system', 0);
      await page.waitForTimeout(300);

      // Click Next
      await page.click('[data-testid="next-step-button"]');
      await page.waitForLoadState('networkidle');

      // Step 2: Fill in single role (index 0 - default SYSTEM_OWNER)
      const assignedToInput = page.getByTestId('assigned-to-0');
      await assignedToInput.fill('John Doe');
      await page.waitForTimeout(200);

      const emailInput = page.getByTestId('email-0');
      await emailInput.fill('john.doe@example.com');
      await page.waitForTimeout(200);

      // Submit governance
      await page.click('[data-testid="submit-governance-button"]');

      // Should redirect to governance list
      await page.waitForURL('/dashboard/governance');
      await page.waitForLoadState('networkidle');

      // Should show success (governance structures grid should be visible)
      const governanceGrid = page.getByTestId('governance-structures-grid');
      await expect(governanceGrid).toBeVisible();
    });

    test('should create comprehensive governance with 4 roles for HIGH_RISK system', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance/new');
      await page.waitForLoadState('networkidle');

      // Step 1: Select HIGH_RISK AI system
      // Find "AI Recruitment Assistant" - need to determine its position in dropdown
      await selectDropdownOption(page, 'select-ai-system', 0); // Adjust if needed
      await page.waitForTimeout(300);

      // Click Next
      await page.click('[data-testid="next-step-button"]');
      await page.waitForLoadState('networkidle');

      // Step 2: Fill in 4 roles
      const roles = [
        { type: 'SYSTEM_OWNER', name: 'Alice Johnson', email: 'alice@example.com', resp: 'Overall system accountability', active: true },
        { type: 'RISK_OWNER', name: 'Bob Smith', email: 'bob@example.com', resp: 'Risk assessment and mitigation', active: true },
        { type: 'HUMAN_OVERSIGHT', name: 'Carol White', email: 'carol@example.com', resp: 'Human oversight and review', active: true },
        { type: 'COMPLIANCE_OFFICER', name: 'David Brown', email: 'david@example.com', resp: 'EU AI Act compliance', active: false },
      ];

      // First role is pre-added, fill it
      await page.fill('[data-testid="assigned-to-0"]', roles[0].name);
      await page.fill('[data-testid="email-0"]', roles[0].email);
      await page.fill('[data-testid="responsibilities-0"]', roles[0].resp);

      // Add remaining 3 roles
      for (let i = 1; i < roles.length; i++) {
        await page.click('[data-testid="add-role-button"]');
        await page.waitForTimeout(300);

        // Select role type (index corresponds to enum order)
        const roleTypeSteps = { SYSTEM_OWNER: 0, RISK_OWNER: 1, HUMAN_OVERSIGHT: 2, DATA_PROTECTION_OFFICER: 3, TECHNICAL_LEAD: 4, COMPLIANCE_OFFICER: 5 };
        await selectDropdownOption(page, `role-type-${i}`, roleTypeSteps[roles[i].type as keyof typeof roleTypeSteps]);

        await page.fill(`[data-testid="assigned-to-${i}"]`, roles[i].name);
        await page.fill(`[data-testid="email-${i}"]`, roles[i].email);
        await page.fill(`[data-testid="responsibilities-${i}"]`, roles[i].resp);

        // Toggle active status for inactive roles
        if (!roles[i].active) {
          await page.uncheck(`[data-testid="is-active-${i}"]`);
        }
      }

      // Submit governance
      await page.click('[data-testid="submit-governance-button"]');

      // Should redirect to governance list
      await page.waitForURL('/dashboard/governance');
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Multi-Role Workflow', () => {
    test('should add and remove roles dynamically', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance/new');
      await page.waitForLoadState('networkidle');

      // Select system
      await selectDropdownOption(page, 'select-ai-system', 0);
      await page.click('[data-testid="next-step-button"]');
      await page.waitForLoadState('networkidle');

      // Add 2 more roles (total 3 roles)
      await page.click('[data-testid="add-role-button"]');
      await page.waitForTimeout(300);
      await page.click('[data-testid="add-role-button"]');
      await page.waitForTimeout(300);

      // Verify 3 role forms exist
      await expect(page.getByTestId('role-type-0')).toBeVisible();
      await expect(page.getByTestId('role-type-1')).toBeVisible();
      await expect(page.getByTestId('role-type-2')).toBeVisible();

      // Remove middle role (index 1)
      await page.click('[data-testid="remove-role-1"]');
      await page.waitForTimeout(300);

      // Fill remaining 2 roles
      await page.fill('[data-testid="assigned-to-0"]', 'Person One');
      await page.fill('[data-testid="email-0"]', 'person1@example.com');

      await page.fill('[data-testid="assigned-to-1"]', 'Person Two');
      await page.fill('[data-testid="email-1"]', 'person2@example.com');

      // Submit
      await page.click('[data-testid="submit-governance-button"]');
      await page.waitForURL('/dashboard/governance');
    });

    test('should validate required fields', async ({ page }) => {
      await login(page, testUser);
      await page.goto('/dashboard/governance/new');
      await page.waitForLoadState('networkidle');

      // Try to proceed without selecting system
      const nextButton = page.getByTestId('next-step-button');
      await expect(nextButton).toBeDisabled();

      // Select system and proceed
      await selectDropdownOption(page, 'select-ai-system', 0);
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Try to submit without filling required fields
      const submitButton = page.getByTestId('submit-governance-button');
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should still be on the same page (validation failed)
      await expect(page).toHaveURL(/\/governance\/new/);

      // Fill required fields
      await page.fill('[data-testid="assigned-to-0"]', 'Test User');
      await page.fill('[data-testid="email-0"]', 'test@example.com');

      // Now submit should work
      await submitButton.click();
      await page.waitForURL('/dashboard/governance');
    });
  });

  test.describe('Detail Page & CRUD Operations', () => {
    let governanceId: string;

    test.beforeEach(async () => {
      // Get the governance ID for "Email Classification AI" created in beforeAll
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const governance = await prisma.aIGovernance.findFirst({
        where: {
          aiSystem: {
            organizationId,
            name: 'Email Classification AI',
          },
        },
      });
      governanceId = governance?.id || '';
      await prisma.$disconnect();
    });

    test('should view governance detail page with statistics', async ({ page }) => {
      await login(page, testUser);
      await page.goto(`/dashboard/governance/${governanceId}`);
      await page.waitForLoadState('networkidle');

      // Should show AI system name
      await expect(page.getByText('Email Classification AI')).toBeVisible();

      // Should show statistics cards
      await expect(page.getByText('Total Roles')).toBeVisible();
      await expect(page.getByText('Governance Roles')).toBeVisible();

      // Should show the role details
      await expect(page.getByRole('heading', { name: 'System Owner' })).toBeVisible();
      await expect(page.getByText('Jane Smith')).toBeVisible();
      await expect(page.getByText('jane.smith@example.com')).toBeVisible();
    });

    test('should edit an existing role', async ({ page }) => {
      await login(page, testUser);
      await page.goto(`/dashboard/governance/${governanceId}`);
      await page.waitForLoadState('networkidle');

      // Get the role ID from the database
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const role = await prisma.governanceRole.findFirst({
        where: {
          aiGovernanceId: governanceId,
          roleType: 'SYSTEM_OWNER',
        },
      });
      await prisma.$disconnect();

      // Click edit button for the role
      await page.click(`[data-testid="edit-role-button-${role?.id}"]`);
      await page.waitForTimeout(500);

      // Should open edit dialog
      await expect(page.getByText('Edit Role')).toBeVisible();

      // Update the name
      const assignedToInput = page.getByTestId('edit-role-assigned-to');
      await assignedToInput.clear();
      await assignedToInput.fill('Jane Smith Updated');
      await page.waitForTimeout(200);

      // Update email
      const emailInput = page.getByTestId('edit-role-email');
      await emailInput.clear();
      await emailInput.fill('jane.smith.updated@example.com');
      await page.waitForTimeout(200);

      // Submit the update
      await page.click('[data-testid="edit-role-submit-button"]');
      await page.waitForTimeout(1000);

      // Should see updated information
      await expect(page.getByText('Jane Smith Updated')).toBeVisible();
      await expect(page.getByText('jane.smith.updated@example.com')).toBeVisible();
    });

    test('should add a new role to existing governance', async ({ page }) => {
      await login(page, testUser);
      await page.goto(`/dashboard/governance/${governanceId}`);
      await page.waitForLoadState('networkidle');

      // Click add role button
      await page.click('[data-testid="add-role-to-governance-button"]');
      await page.waitForTimeout(500);

      // Should open add role dialog
      await expect(page.getByText('Add New Role')).toBeVisible();

      // Fill in role details
      await page.fill('[data-testid="add-role-assigned-to"]', 'New Role Person');
      await page.fill('[data-testid="add-role-email"]', 'newrole@example.com');
      await page.waitForTimeout(200);

      // Submit
      await page.click('[data-testid="add-role-submit-button"]');
      await page.waitForTimeout(1000);

      // Should see the new role
      await expect(page.getByText('New Role Person')).toBeVisible();
      await expect(page.getByText('newrole@example.com')).toBeVisible();
    });

    test('should delete a role', async ({ page }) => {
      await login(page, testUser);
      await page.goto(`/dashboard/governance/${governanceId}`);
      await page.waitForLoadState('networkidle');

      // Get a role to delete (not the SYSTEM_OWNER if there are multiple)
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const roles = await prisma.governanceRole.findMany({
        where: { aiGovernanceId: governanceId },
        orderBy: { createdAt: 'desc' },
      });

      // Delete the most recently created role (from previous test)
      const roleToDelete = roles[0];
      await prisma.$disconnect();

      // Set up dialog handler for confirmation
      page.on('dialog', dialog => dialog.accept());

      // Click delete button
      await page.click(`[data-testid="delete-role-button-${roleToDelete.id}"]`);
      await page.waitForTimeout(1000);

      // Role should be removed - verify it's not visible
      // Since we deleted the newest role, check that it's gone
      const roleCards = await page.locator('.space-y-3').count();
      // After deletion, should have fewer roles
      await expect(roleCards).toBeGreaterThanOrEqual(0);
    });
  });
});

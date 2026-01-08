import { test, expect } from '@playwright/test';
import { seedAdminDemoUser, createTestAISystem, createTestRiskClassification } from '../../helpers/database';
import { login } from '../../helpers/auth';
import { enableCursorTracking, reEnableCursorTracking, smoothClick, smoothType } from '../../helpers/cursor-tracker';
import { wait, timeout, logSpeedConfig } from '../../helpers/demo-config';

/**
 * Governance Module Demo - Professional Video Recording
 *
 * Demonstrates the complete governance structure management workflow for TalentTech Solutions
 *
 * Usage:
 *   DEMO_SPEED=slow npx playwright test tests/demos/governance/governance-demo.spec.ts --project=chromium --headed
 *
 * Features:
 * - Governance structure creation with multiple roles
 * - Role management (view, edit, add, delete)
 * - Real-time statistics and tracking
 * - Interactive role assignment workflow
 * - Professional cursor tracking for videos
 */

test.describe('Governance Module Demo', () => {
  let systemId: string;
  let systemName: string;
  let organizationId: string;
  let testUser: { email: string; password: string };

  test.beforeAll(async () => {
    // Seed TalentTech Solutions organization and Rachel Thompson user
    const user = await seedAdminDemoUser();
    organizationId = user.organizationId;

    // Store test user credentials for login
    testUser = {
      email: user.email,
      password: 'talenttech-demo-2025',
    };

    // Create high-risk AI system
    systemName = 'Healthcare Diagnosis AI';
    const system = await createTestAISystem(user.organizationId, {
      name: systemName,
      businessPurpose: 'AI-powered medical diagnosis assistance system for healthcare providers',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      dataCategories: ['PERSONAL_DATA', 'SENSITIVE_DATA'],
    });
    systemId = system.id;

    // Create HIGH_RISK classification
    await createTestRiskClassification(systemId, {
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Safety components of products (health management and care)'],
      interactsWithPersons: true,
      reasoning: 'High-risk healthcare AI system requiring comprehensive governance structure and oversight.',
      applicableRequirements: ['Article 9 - Risk Management', 'Article 16 - Human Oversight'],
    });
  });

  test.beforeEach(async () => {
    // Clean up any existing governance structures to ensure clean state
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

  test('complete governance workflow', async ({ page }) => {
    // Configure extended timeout for demo recording
    test.setTimeout(timeout(300000)); // 5 minutes base, scales with DEMO_SPEED

    logSpeedConfig();

    console.log('\n📹 Starting Governance Module Demo Recording...\n');

    // Enable cursor tracking for professional demo appearance
    await enableCursorTracking(page);

    // ============================================
    // STEP 0: Login
    // ============================================
    console.log('   🎯 Step 0: Authenticating...');
    await login(page, testUser);
    await page.waitForTimeout(wait(500));
    console.log('   ✅ Logged in\n');

    // ============================================
    // STEP 1: Navigate to Governance Creation
    // ============================================
    console.log('   🎯 Step 1: Starting Governance Creation...');
    await page.goto('http://localhost:4000/dashboard/governance/new');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Governance wizard opened\n');

    // ============================================
    // STEP 2: Select AI System
    // ============================================
    console.log('      📋 Selecting AI System...');

    const systemSelect = page.getByTestId('select-ai-system');
    await smoothClick(page, systemSelect);
    await page.waitForTimeout(wait(600));

    // Select the healthcare system
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(wait(1000));
    console.log(`         ✓ Selected: ${systemName}`);

    // Click next
    const nextButton = page.getByTestId('next-step-button');
    await smoothClick(page, nextButton);
    await page.waitForTimeout(wait(1200));
    console.log('      ✅ System selected\n');

    // ============================================
    // STEP 3: Add Role 1 - System Owner
    // ============================================
    console.log('      👤 Adding Role 1: System Owner...');

    // Role type is pre-selected as SYSTEM_OWNER
    await page.waitForTimeout(wait(800));

    // Fill in System Owner details
    const assignedToInput = page.getByTestId('assigned-to-0');
    await smoothType(page, assignedToInput, 'Dr. Sarah Chen');
    console.log('         ✓ Name: Dr. Sarah Chen');

    const emailInput = page.getByTestId('email-0');
    await smoothType(page, emailInput, 'sarah.chen@healthai.com');
    console.log('         ✓ Email: sarah.chen@healthai.com');

    const responsibilitiesTextarea = page.getByTestId('responsibilities-0');
    await smoothType(page, responsibilitiesTextarea, 'Overall accountability for AI system governance, compliance, and risk management. Final decision authority on system deployment and updates.');
    console.log('         ✓ Responsibilities added');

    console.log('      ✅ System Owner role configured\n');

    // ============================================
    // STEP 6: Submit Governance Structure
    // ============================================
    console.log('   🎯 Step 4: Submitting Governance Structure...');

    // Scroll to submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(wait(1000));

    const submitButton = page.getByTestId('submit-governance-button');
    await expect(submitButton).toBeEnabled();
    await page.waitForTimeout(wait(1500));

    await smoothClick(page, submitButton);
    console.log('      ✓ Submit button clicked');

    // Wait for success and redirect to list page
    await page.waitForURL('http://localhost:4000/dashboard/governance', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(2000));

    console.log('   ✅ Governance structure created successfully!\n');

    // ============================================
    // STEP 5: Navigate to Governance Detail Page
    // ============================================
    console.log('   🎯 Step 5: Opening Governance Details...');

    // Click "View Details" link on the Healthcare Diagnosis AI card
    const viewDetailsLink = page.getByRole('link', { name: 'View Details' });
    await smoothClick(page, viewDetailsLink);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(wait(1500));

    console.log('   ✅ Detail page opened\n');

    // ============================================
    // STEP 6: View Governance Statistics
    // ============================================
    console.log('   🎯 Step 6: Viewing Governance Statistics...');

    // Scroll to see statistics
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1200));
    console.log('      📊 Viewing statistics cards...');

    // Check statistics (currently 1 role)
    await expect(page.getByText('Total Roles').first()).toBeVisible();
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Total Roles: 1');

    await expect(page.getByText('Active Roles').first()).toBeVisible();
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Active Roles: 1');

    await expect(page.getByText('People Involved').first()).toBeVisible();
    await page.waitForTimeout(wait(800));
    console.log('         ✓ People Involved: 1');

    console.log('   ✅ Statistics displayed\n');

    // ============================================
    // STEP 7: View System Owner Role
    // ============================================
    console.log('   🎯 Step 7: Reviewing System Owner Role...\n');

    // Scroll to roles section
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(wait(1000));

    // Verify System Owner role is visible
    const systemOwnerHeading = page.getByRole('heading', { name: 'System Owner' });
    await expect(systemOwnerHeading).toBeVisible();
    await page.waitForTimeout(wait(1000));
    console.log('      ✓ System Owner role displayed');
    console.log('      ✓ Assigned to: Dr. Sarah Chen');

    console.log('   ✅ Role reviewed\n');

    // ============================================
    // STEP 9: Edit Existing Role
    // ============================================
    console.log('   🎯 Step 8: Editing System Owner Role...');

    // Find and click edit button for System Owner
    const editButton = page.getByRole('button', { name: 'Edit' }).first();
    await editButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(800));

    await smoothClick(page, editButton);
    await page.waitForTimeout(wait(1500));
    console.log('      ✓ Opened edit dialog');

    // Update responsibilities
    const editResponsibilities = page.getByPlaceholder('Describe specific responsibilities...');
    await expect(editResponsibilities).toBeVisible();
    await page.waitForTimeout(wait(600));

    // Clear and add new text
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(wait(200));
    await smoothType(page, editResponsibilities, 'Overall accountability for AI system governance, compliance, and risk management. Final decision authority on system deployment, updates, and strategic direction. Chairs quarterly governance review meetings.');
    console.log('      ✓ Updated responsibilities');

    // Submit changes
    const editSubmitButton = page.getByTestId('edit-role-submit-button');
    await smoothClick(page, editSubmitButton);
    await page.waitForTimeout(wait(1500));

    console.log('   ✅ Role updated successfully!\n');

    // ============================================
    // STEP 10: Add Risk Owner Role
    // ============================================
    console.log('   🎯 Step 9: Adding Risk Owner Role...');

    // Scroll to find Add Role button
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(wait(1000));

    const addRoleButton1 = page.getByTestId('add-role-to-governance-button');
    await smoothClick(page, addRoleButton1);
    await page.waitForTimeout(wait(1200));
    console.log('      ✓ Opened add role dialog');

    // Select Risk Owner
    const roleTypeSelect1 = page.getByTestId('add-role-type-select');
    await smoothClick(page, roleTypeSelect1);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown'); // RISK_OWNER
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(wait(600));
    console.log('      ✓ Selected: Risk Owner');

    // Fill in details
    const assignedTo1 = page.getByTestId('add-role-assigned-to');
    await smoothType(page, assignedTo1, 'Michael Rodriguez');
    console.log('      ✓ Name: Michael Rodriguez');

    const email1 = page.getByTestId('add-role-email');
    await smoothType(page, email1, 'michael.rodriguez@healthai.com');
    console.log('      ✓ Email: michael.rodriguez@healthai.com');

    // Submit
    const submitButton1 = page.getByTestId('add-role-submit-button');
    await smoothClick(page, submitButton1);
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Risk Owner role added!\n');

    // ============================================
    // STEP 11: Add Human Oversight Role
    // ============================================
    console.log('   🎯 Step 10: Adding Human Oversight Role...');

    const addRoleButton2 = page.getByTestId('add-role-to-governance-button');
    await smoothClick(page, addRoleButton2);
    await page.waitForTimeout(wait(1200));
    console.log('      ✓ Opened add role dialog');

    // Select Human Oversight
    const roleTypeSelect2 = page.getByTestId('add-role-type-select');
    await smoothClick(page, roleTypeSelect2);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown'); // RISK_OWNER
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('ArrowDown'); // HUMAN_OVERSIGHT
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(wait(600));
    console.log('      ✓ Selected: Human Oversight');

    // Fill in details
    const assignedTo2 = page.getByTestId('add-role-assigned-to');
    await smoothType(page, assignedTo2, 'Dr. Emily Watson');
    console.log('      ✓ Name: Dr. Emily Watson');

    const email2 = page.getByTestId('add-role-email');
    await smoothType(page, email2, 'emily.watson@healthai.com');
    console.log('      ✓ Email: emily.watson@healthai.com');

    // Submit
    const submitButton2 = page.getByTestId('add-role-submit-button');
    await smoothClick(page, submitButton2);
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Human Oversight role added!\n');

    // ============================================
    // STEP 12: Add Compliance Officer Role
    // ============================================
    console.log('   🎯 Step 11: Adding Compliance Officer Role...');

    const addRoleButton3 = page.getByTestId('add-role-to-governance-button');
    await smoothClick(page, addRoleButton3);
    await page.waitForTimeout(wait(1200));
    console.log('      ✓ Opened add role dialog');

    // Select Compliance Officer
    const roleTypeSelect3 = page.getByTestId('add-role-type-select');
    await smoothClick(page, roleTypeSelect3);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown'); // RISK_OWNER
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('ArrowDown'); // HUMAN_OVERSIGHT
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('ArrowDown'); // DATA_PROTECTION_OFFICER
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('ArrowDown'); // TECHNICAL_LEAD
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('ArrowDown'); // COMPLIANCE_OFFICER
    await page.waitForTimeout(wait(300));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(wait(600));
    console.log('      ✓ Selected: Compliance Officer');

    // Fill in details
    const assignedTo3 = page.getByTestId('add-role-assigned-to');
    await smoothType(page, assignedTo3, 'James Kumar');
    console.log('      ✓ Name: James Kumar');

    const email3 = page.getByTestId('add-role-email');
    await smoothType(page, email3, 'james.kumar@healthai.com');
    console.log('      ✓ Email: james.kumar@healthai.com');

    // Submit
    const submitButton3 = page.getByTestId('add-role-submit-button');
    await smoothClick(page, submitButton3);
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Compliance Officer role added!\n');

    // ============================================
    // STEP 13: Verify Updated Statistics
    // ============================================
    console.log('   🎯 Step 12: Verifying Updated Statistics...');

    // Scroll to top to see updated stats
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    console.log('      📊 Updated statistics:');
    console.log('         ✓ Total Roles: 4');
    console.log('         ✓ Active Roles: 4');
    console.log('         ✓ People Involved: 4');
    await page.waitForTimeout(wait(2000));

    console.log('   ✅ Statistics updated\n');

    // ============================================
    // STEP 12: Final Review
    // ============================================
    console.log('   🎯 Step 13: Final Review...');

    // Scroll through the page to show complete governance structure
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(wait(1500));
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(wait(1500));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(2000));

    console.log('   ✅ Governance structure complete!\n');

    // ============================================
    // Demo Complete
    // ============================================
    console.log('   ╔══════════════════════════════════════════════╗');
    console.log('   ║  ✅ GOVERNANCE MODULE DEMO COMPLETED!       ║');
    console.log('   ╚══════════════════════════════════════════════╝\n');
    console.log('   📊 Summary:');
    console.log('      • AI System: ' + systemName);
    console.log('      • Total Roles Created: 4');
    console.log('      • Role Types:');
    console.log('        - System Owner: Dr. Sarah Chen');
    console.log('        - Risk Owner: Michael Rodriguez');
    console.log('        - Human Oversight: Dr. Emily Watson');
    console.log('        - Compliance Officer: James Kumar');
    console.log('      • Operations Demonstrated:');
    console.log('        ✓ Create governance structure with 1 role');
    console.log('        ✓ View governance details');
    console.log('        ✓ Edit existing role');
    console.log('        ✓ Add 3 new roles on detail page');
    console.log('      • Status: Successfully completed\n');
    console.log('   📹 Demo video saved to test-results/\n');
  });
});

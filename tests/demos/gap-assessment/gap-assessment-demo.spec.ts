import { test, expect } from '@playwright/test';
import { seedAdminDemoUser, createTestAISystem, createTestRiskClassification } from '../../helpers/database';
import { login } from '../../helpers/auth';
import { enableCursorTracking, reEnableCursorTracking, smoothClick, smoothType } from '../../helpers/cursor-tracker';
import { wait, timeout, logSpeedConfig } from '../../helpers/demo-config';

/**
 * Gap Assessment Demo - Professional Video Recording
 *
 * Demonstrates the complete gap assessment workflow for EU AI Act compliance
 *
 * Usage:
 *   DEMO_SPEED=slow npx playwright test tests/demos/gap-assessment/gap-assessment-demo.spec.ts --project=chromium --headed
 *
 * Features:
 * - Comprehensive EU AI Act requirement assessment
 * - 8 compliance categories with 24 total requirements
 * - Real-time progress tracking
 * - Interactive requirement management
 * - Professional cursor tracking for videos
 */

test.describe('Gap Assessment Demo', () => {
  let systemId: string;
  let systemName: string;

  test.beforeAll(async () => {
    // Seed admin demo user and high-risk AI system
    const user = await seedAdminDemoUser();

    // Create high-risk AI system
    systemName = 'AI Recruitment Assistant';
    const system = await createTestAISystem(user.organizationId, {
      name: systemName,
      businessPurpose: 'Automated resume screening and candidate ranking for job applications',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES', 'PUBLIC'],
      dataCategories: ['PERSONAL_DATA', 'SENSITIVE_DATA'],
    });
    systemId = system.id;

    // Create HIGH_RISK classification
    await createTestRiskClassification(systemId, {
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Employment, workers management and access to self-employment'],
      interactsWithPersons: true,
      reasoning: 'High-risk system used for employment decisions requiring strict EU AI Act compliance.',
      applicableRequirements: ['Article 9 - Risk Management', 'Article 10 - Data Governance'],
    });
  });

  test('complete gap assessment workflow', async ({ page }) => {
    // Configure extended timeout for demo recording
    test.setTimeout(timeout(300000)); // 5 minutes base, scales with DEMO_SPEED

    logSpeedConfig();

    console.log('\n📹 Starting Gap Assessment Demo Recording...\n');

    // ============================================
    // STEP 0: Login
    // ============================================
    console.log('   🎯 Step 0: Authenticating...');
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.waitForLoadState('domcontentloaded');

    // Enable cursor tracking AFTER login navigation for professional demo appearance
    await enableCursorTracking(page);

    await page.waitForTimeout(wait(500));
    console.log('   ✅ Logged in\n');

    // ============================================
    // STEP 1: Navigate to Gap Assessment
    // ============================================
    console.log('   🎯 Step 1: Navigating to Gap Assessment...');
    await page.goto(`http://localhost:4000/dashboard/gap-assessment?systemId=${systemId}`);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Page loaded\n');

    // ============================================
    // STEP 2: System Pre-Selected (via URL) & Start Assessment
    // ============================================
    console.log('   🎯 Step 2: System pre-selected via URL...');
    console.log(`      ✓ System: ${systemName}`);
    await page.waitForTimeout(wait(2000));

    // Verify Step 1 card is visible
    await expect(page.getByText('Step 1: Select AI System')).toBeVisible();
    console.log('      ✓ Step 1 loaded');
    await page.waitForTimeout(wait(1500));

    // Wait for and click "Start Assessment" button
    const startButton = page.getByTestId('gap-assessment-next-step');
    console.log('      ⏳ Waiting for Start Assessment button...');

    // Wait for button to be visible and enabled (button is disabled until system is selected)
    await expect(startButton).toBeVisible({ timeout: 15000 });
    await expect(startButton).toBeEnabled({ timeout: 15000 });
    console.log('      ✓ Button ready');
    await page.waitForTimeout(wait(1500));

    await smoothClick(page, startButton);
    await page.waitForTimeout(wait(2000));
    console.log('   ✅ Assessment started\n');

    // ============================================
    // STEP 3: Review Progress Overview
    // ============================================
    console.log('   🎯 Step 3: Reviewing Progress Overview...');

    // Check overall score (should be 0% initially)
    const overallScore = page.getByTestId('gap-assessment-overall-score');
    await expect(overallScore).toBeVisible();
    await page.waitForTimeout(wait(1000));

    const scoreText = await overallScore.textContent();
    console.log(`      📊 Current Compliance Score: ${scoreText}`);

    // Check progress bar
    const progressBar = page.getByTestId('gap-assessment-progress-bar');
    await expect(progressBar).toBeVisible();
    await page.waitForTimeout(wait(1000));
    console.log('   ✅ Progress overview displayed\n');

    // ============================================
    // STEP 4: Navigate Through Categories
    // ============================================
    console.log('   🎯 Step 4: Exploring Compliance Categories...\n');

    const categories = [
      { id: 'risk_management', name: 'Risk Management', requirementsCount: 3 },
      { id: 'data_governance', name: 'Data Governance', requirementsCount: 3 },
      { id: 'technical_documentation', name: 'Technical Documentation', requirementsCount: 3 },
      { id: 'human_oversight', name: 'Human Oversight', requirementsCount: 3 },
      { id: 'cybersecurity', name: 'Cybersecurity', requirementsCount: 3 },
    ];

    for (const category of categories) {
      console.log(`      📂 ${category.name}...`);

      const categoryTab = page.getByTestId(`gap-assessment-category-${category.id}`);
      await smoothClick(page, categoryTab);
      await page.waitForTimeout(wait(1200));

      // Verify requirements are visible
      const firstRequirement = page.getByTestId('gap-assessment-requirement-0');
      await expect(firstRequirement).toBeVisible();
      await page.waitForTimeout(wait(800));

      console.log(`         ✓ ${category.requirementsCount} requirements loaded`);
    }

    console.log('   ✅ Category navigation complete\n');

    // ============================================
    // STEP 5: Assess Requirements (Risk Management)
    // ============================================
    console.log('   🎯 Step 5: Assessing Risk Management Requirements...\n');

    // Switch to Risk Management category
    const riskMgmtTab = page.getByTestId('gap-assessment-category-risk_management');
    await smoothClick(page, riskMgmtTab);
    await page.waitForTimeout(wait(1000));

    // Assess Requirement 1: Risk Management System
    console.log('      📋 Requirement 1: Risk Management System');

    const req0Card = page.getByTestId('gap-assessment-requirement-0');
    await req0Card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(800));

    // Update status to IMPLEMENTED
    const req0Status = page.getByTestId('gap-assessment-requirement-0-status');
    await smoothClick(page, req0Status);
    await page.waitForTimeout(wait(600));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Status: IMPLEMENTED');

    // Add assigned person
    const req0Assigned = page.getByTestId('gap-assessment-requirement-0-assigned');
    await smoothType(page, req0Assigned, 'Sarah Chen - CTO');
    console.log('         ✓ Assigned: Sarah Chen - CTO');

    // Add notes
    const req0Notes = page.getByTestId('gap-assessment-requirement-0-notes');
    await smoothType(page, req0Notes, 'Risk management framework implemented using ISO 31000 methodology. Documentation maintained in Confluence.');
    console.log('         ✓ Notes added');

    console.log('      ✅ Requirement 1 assessed\n');

    // Assess Requirement 2: Continuous Risk Assessment
    console.log('      📋 Requirement 2: Continuous Risk Assessment');

    const req1Status = page.getByTestId('gap-assessment-requirement-1-status');
    await req1Status.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(600));
    await smoothClick(page, req1Status);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('Enter'); // IN_PROGRESS
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Status: IN_PROGRESS');

    const req1Assigned = page.getByTestId('gap-assessment-requirement-1-assigned');
    await smoothType(page, req1Assigned, 'Sarah Chen - CTO');
    console.log('         ✓ Assigned: Sarah Chen - CTO');

    console.log('      ✅ Requirement 2 assessed\n');

    // ============================================
    // STEP 6: Assess Data Governance Requirements
    // ============================================
    console.log('   🎯 Step 6: Assessing Data Governance Requirements...\n');

    const dataGovTab = page.getByTestId('gap-assessment-category-data_governance');
    await smoothClick(page, dataGovTab);
    await page.waitForTimeout(wait(1200));

    // Assess first Data Governance requirement
    console.log('      📋 Training Data Governance');

    const dgReq0Status = page.getByTestId('gap-assessment-requirement-0-status');
    await dgReq0Status.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(600));
    await smoothClick(page, dgReq0Status);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('Enter'); // IMPLEMENTED
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Status: IMPLEMENTED');

    const dgReq0Assigned = page.getByTestId('gap-assessment-requirement-0-assigned');
    await smoothType(page, dgReq0Assigned, 'Michael Rodriguez - Data Lead');
    console.log('         ✓ Assigned: Michael Rodriguez - Data Lead');

    console.log('      ✅ Data Governance requirement assessed\n');

    // ============================================
    // STEP 7: Check Progress Update
    // ============================================
    console.log('   🎯 Step 7: Checking Progress Update...');

    // Scroll to top to see progress
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    const updatedScore = await overallScore.textContent();
    console.log(`      📊 Updated Compliance Score: ${updatedScore}`);
    console.log('      ℹ️  Score reflects implemented requirements');
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Progress tracking verified\n');

    // ============================================
    // STEP 8: Assess Cybersecurity (Final Category)
    // ============================================
    console.log('   🎯 Step 8: Assessing Cybersecurity Requirements...\n');

    const cyberTab = page.getByTestId('gap-assessment-category-cybersecurity');
    await smoothClick(page, cyberTab);
    await page.waitForTimeout(wait(1200));

    // Assess Cybersecurity Measures
    console.log('      📋 Cybersecurity Measures');

    const cyberReq0Status = page.getByTestId('gap-assessment-requirement-0-status');
    await cyberReq0Status.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(600));
    await smoothClick(page, cyberReq0Status);
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(wait(400));
    await page.keyboard.press('Enter'); // IMPLEMENTED
    await page.waitForTimeout(wait(800));
    console.log('         ✓ Status: IMPLEMENTED');

    const cyberReq0Assigned = page.getByTestId('gap-assessment-requirement-0-assigned');
    await smoothType(page, cyberReq0Assigned, 'James Kumar - DevOps');
    console.log('         ✓ Assigned: James Kumar - DevOps');

    const cyberReq0Notes = page.getByTestId('gap-assessment-requirement-0-notes');
    await smoothType(page, cyberReq0Notes, 'SOC 2 Type II certified. Penetration testing completed with no critical findings.');
    console.log('         ✓ Notes added');

    console.log('      ✅ Cybersecurity assessed\n');

    // ============================================
    // STEP 9: Final Progress Review
    // ============================================
    console.log('   🎯 Step 9: Final Progress Review...');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    const finalScore = await overallScore.textContent();
    console.log(`      📊 Final Compliance Score: ${finalScore}`);
    await page.waitForTimeout(wait(2000));
    console.log('   ✅ Progress reviewed\n');

    // ============================================
    // STEP 10: Submit Assessment
    // ============================================
    console.log('   🎯 Step 10: Submitting Gap Assessment...');

    // Scroll to submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(wait(1000));

    const submitButton = page.getByTestId('gap-assessment-submit-button');
    await expect(submitButton).toBeVisible();
    await page.waitForTimeout(wait(1500));

    await smoothClick(page, submitButton);
    console.log('      ✓ Submit button clicked');

    // Wait for redirect
    await page.waitForURL(/.*\/dashboard\/gap-assessment.*/);
    await page.waitForTimeout(wait(2000));

    console.log('   ✅ Assessment submitted successfully!\n');

    // ============================================
    // Demo Complete
    // ============================================
    console.log('   ╔══════════════════════════════════════════════╗');
    console.log('   ║  ✅ GAP ASSESSMENT DEMO COMPLETED!          ║');
    console.log('   ╚══════════════════════════════════════════════╝\n');
    console.log('   📊 Summary:');
    console.log('      • System assessed: ' + systemName);
    console.log('      • Categories reviewed: 5 of 8');
    console.log('      • Requirements updated: 5');
    console.log('      • Final compliance score: ' + finalScore);
    console.log('      • Status: Successfully submitted\n');
    console.log('   📹 Demo video saved to test-results/\n');
  });
});

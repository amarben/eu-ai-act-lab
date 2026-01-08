import { test, expect } from '@playwright/test';
import { seedAdminDemoUser, createTestAISystem, createTestRiskClassification } from '../../helpers/database';
import { login } from '../../helpers/auth';

/**
 * Smoke Test: Gap Assessment Feature
 *
 * Purpose: Verify all testIDs exist and are accessible before writing full demo
 *
 * Following Demo Workflow Best Practices:
 * - STEP 0: ALWAYS RUN SMOKE TEST FIRST
 * - Verifies testIDs exist before demo creation
 * - Catches missing testIDs early
 * - Runs in headless mode for speed
 */

test.describe('Gap Assessment - Smoke Test', () => {
  let systemId: string;

  test.beforeAll(async () => {
    // Seed TalentTech Solutions organization and Rachel Thompson user
    const user = await seedAdminDemoUser();

    // Create test AI system
    const system = await createTestAISystem(user.organizationId, {
      name: 'Test HR Recruitment System',
      businessPurpose: 'AI-powered resume screening',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      dataCategories: ['PERSONAL_DATA'],
    });
    systemId = system.id;

    // Create HIGH_RISK classification
    await createTestRiskClassification(systemId, {
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Employment, workers management and access to self-employment'],
      interactsWithPersons: true,
      reasoning: 'High-risk system for employment decisions',
      applicableRequirements: ['Article 9', 'Article 10'],
    });
  });

  test('all testIDs exist and are accessible', async ({ page }) => {
    console.log('\n🧪 Running Gap Assessment Smoke Test\n');

    // Login first
    console.log('   🔐 Logging in...');
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    console.log('   ✅ Logged in\n');

    // Navigate to gap assessment page with systemId
    console.log('   📍 Navigating to gap assessment page...');
    await page.goto(`http://localhost:4000/dashboard/gap-assessment?systemId=${systemId}`);
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Page loaded\n');

    // ============================================
    // STEP 1: System Selection TestIDs
    // ============================================
    console.log('   🔍 Verifying Step 1 testIDs (System Selection)...');

    await expect(page.getByTestId('gap-assessment-system-select')).toBeVisible();
    console.log('      ✓ gap-assessment-system-select');

    await expect(page.getByTestId('gap-assessment-next-step')).toBeVisible();
    console.log('      ✓ gap-assessment-next-step');

    console.log('   ✅ Step 1 testIDs verified\n');

    // ============================================
    // Navigate to Step 2 (Assessment)
    // ============================================
    console.log('   ➡️  Advancing to Step 2...');
    const nextButton = page.getByTestId('gap-assessment-next-step');
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    console.log('   ✅ Navigated to Step 2\n');

    // ============================================
    // STEP 2: Progress & Overview TestIDs
    // ============================================
    console.log('   🔍 Verifying Step 2 testIDs (Progress & Overview)...');

    await expect(page.getByTestId('gap-assessment-overall-score')).toBeVisible();
    console.log('      ✓ gap-assessment-overall-score');

    await expect(page.getByTestId('gap-assessment-progress-bar')).toBeVisible();
    console.log('      ✓ gap-assessment-progress-bar');

    console.log('   ✅ Progress testIDs verified\n');

    // ============================================
    // STEP 2: Category Tab TestIDs
    // ============================================
    console.log('   🔍 Verifying category tab testIDs...');

    const categories = [
      'risk_management',
      'data_governance',
      'technical_documentation',
      'record_keeping',
      'transparency',
      'human_oversight',
      'accuracy_robustness',
      'cybersecurity',
    ];

    for (const category of categories) {
      await expect(page.getByTestId(`gap-assessment-category-${category}`)).toBeVisible();
      console.log(`      ✓ gap-assessment-category-${category}`);
    }

    console.log('   ✅ Category tab testIDs verified\n');

    // ============================================
    // STEP 2: First Requirement Card TestIDs
    // ============================================
    console.log('   🔍 Verifying requirement card testIDs (first requirement)...');

    await expect(page.getByTestId('gap-assessment-requirement-0')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0');

    await expect(page.getByTestId('gap-assessment-requirement-0-status')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0-status');

    await expect(page.getByTestId('gap-assessment-requirement-0-priority')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0-priority');

    await expect(page.getByTestId('gap-assessment-requirement-0-assigned')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0-assigned');

    await expect(page.getByTestId('gap-assessment-requirement-0-due-date')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0-due-date');

    await expect(page.getByTestId('gap-assessment-requirement-0-notes')).toBeVisible();
    console.log('      ✓ gap-assessment-requirement-0-notes');

    console.log('   ✅ Requirement card testIDs verified\n');

    // ============================================
    // Test other categories by clicking tabs
    // ============================================
    console.log('   🔍 Verifying requirements in other categories...');

    // Test DATA_GOVERNANCE category
    const dataGovTab = page.getByTestId('gap-assessment-category-data_governance');
    await dataGovTab.click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('gap-assessment-requirement-0')).toBeVisible();
    console.log('      ✓ DATA_GOVERNANCE requirements accessible');

    // Test CYBERSECURITY category
    const cyberTab = page.getByTestId('gap-assessment-category-cybersecurity');
    await cyberTab.click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('gap-assessment-requirement-0')).toBeVisible();
    console.log('      ✓ CYBERSECURITY requirements accessible');

    console.log('   ✅ Multi-category navigation verified\n');

    // ============================================
    // STEP 2: Navigation & Submit TestIDs
    // ============================================
    console.log('   🔍 Verifying navigation testIDs...');

    await expect(page.getByTestId('gap-assessment-prev-step')).toBeVisible();
    console.log('      ✓ gap-assessment-prev-step');

    await expect(page.getByTestId('gap-assessment-submit-button')).toBeVisible();
    console.log('      ✓ gap-assessment-submit-button');

    console.log('   ✅ Navigation testIDs verified\n');

    // ============================================
    // Summary
    // ============================================
    console.log('   ╔═══════════════════════════════════════════╗');
    console.log('   ║  ✅ ALL TESTIDS VERIFIED SUCCESSFULLY!   ║');
    console.log('   ╚═══════════════════════════════════════════╝\n');
    console.log('   📊 Summary:');
    console.log('      • Step 1: 2 testIDs ✓');
    console.log('      • Step 2 Progress: 2 testIDs ✓');
    console.log('      • Category Tabs: 8 testIDs ✓');
    console.log('      • Requirement Cards: 6 testIDs per req ✓');
    console.log('      • Navigation: 2 testIDs ✓');
    console.log('      • Total: 20+ core testIDs verified\n');
    console.log('   🎯 Ready for full demo script creation!');
    console.log('   📝 Next: Create gap-assessment-demo.spec.ts\n');
  });
});

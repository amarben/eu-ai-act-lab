import { test, expect } from '@playwright/test';
import {
  seedAdminDemoUser,
  createTestAISystem,
  createTestRiskClassification,
  createTestGapAssessment,
  createTestTechnicalDocumentation,
  createTestRiskRegister,
  createTestGovernance,
} from '../../helpers/database';
import { login } from '../../helpers/auth';
import { enableCursorTracking, reEnableCursorTracking, smoothClick } from '../../helpers/cursor-tracker';
import { wait, timeout, logSpeedConfig } from '../../helpers/demo-config';

/**
 * EU AI Act Certification Demo - Professional Video Recording
 *
 * Demonstrates the complete EU AI Act compliance certification workflow
 *
 * Usage:
 *   DEMO_SPEED=slow npx playwright test tests/demos/certification/certification-demo.spec.ts --project=chromium --headed
 *
 * Features:
 * - Dashboard certification readiness card
 * - Detailed compliance breakdown (Gap, Docs, Risks, Governance)
 * - Export final certification certificate as PDF
 * - Professional cursor tracking for videos
 */

test.describe('EU AI Act Certification Demo', () => {
  let systemId: string;
  let systemName: string;

  test.beforeAll(async () => {
    // Seed admin demo user and fully compliant high-risk AI system
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

    // Create fully compliant Gap Assessment (100% implemented)
    await createTestGapAssessment(systemId, {
      overallScore: 100,
      allRequirementsImplemented: true,
    });

    // Create complete Technical Documentation
    await createTestTechnicalDocumentation(systemId, {
      intendedUse: 'Complete intended use description (100+ chars)...',
      foreseeableMisuse: 'Complete foreseeable misuse documentation (100+ chars)...',
      systemArchitecture: 'Complete system architecture details (100+ chars)...',
      trainingData: 'Complete training data documentation (100+ chars)...',
      modelPerformance: 'Complete model performance metrics (100+ chars)...',
      validationTesting: 'Complete validation testing results (100+ chars)...',
      humanOversightDoc: 'Complete human oversight procedures (100+ chars)...',
      cybersecurity: 'Complete cybersecurity measures (100+ chars)...',
      completenessPercentage: 100,
    });

    // Create Risk Register with all risks mitigated
    await createTestRiskRegister(systemId, {
      allRisksMitigated: true,
    });

    // Create Governance structure with required roles
    await createTestGovernance(systemId, {
      hasSystemOwner: true,
      hasRiskOwner: true,
      hasComplianceOfficer: true,
    });
  });

  test('complete certification workflow', async ({ page }) => {
    // Configure extended timeout for demo recording
    test.setTimeout(timeout(180000)); // 3 minutes base, scales with DEMO_SPEED

    logSpeedConfig();

    console.log('\n📹 Starting EU AI Act Certification Demo Recording...\n');

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
    // STEP 1: Navigate to Dashboard
    // ============================================
    console.log('   🎯 Step 1: Navigating to Dashboard...');
    await page.goto('http://localhost:4000/dashboard');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(2000));
    console.log('   ✅ Dashboard loaded\n');

    // ============================================
    // STEP 2: View Certification Readiness Card
    // ============================================
    console.log('   🎯 Step 2: Viewing Certification Readiness Card...');

    // Wait for certification readiness card to be visible
    const readinessCard = page.getByTestId('certification-readiness-card');
    await expect(readinessCard).toBeVisible();
    console.log('      ✓ Certification card visible');
    await page.waitForTimeout(wait(1500));

    // Verify overall compliance score (should be ~100%)
    const scoreElement = readinessCard.getByTestId('certification-score');
    await expect(scoreElement).toBeVisible();
    const scoreText = await scoreElement.textContent();
    console.log(`      ✓ Compliance Score: ${scoreText}`);
    await page.waitForTimeout(wait(1500));

    // Verify progress bar is visible
    const progressBar = readinessCard.getByTestId('certification-progress');
    await expect(progressBar).toBeVisible();
    console.log('      ✓ Progress bar shown');
    await page.waitForTimeout(wait(1000));

    // Scroll to readiness card for better visibility
    await readinessCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait(1500));
    console.log('   ✅ Readiness card reviewed\n');

    // ============================================
    // STEP 3: Review Compliance Areas Breakdown
    // ============================================
    console.log('   🎯 Step 3: Reviewing Compliance Areas...');

    // Verify all compliance areas are shown
    await expect(readinessCard.getByText('Gap Assessment')).toBeVisible();
    console.log('      ✓ Gap Assessment status shown');
    await page.waitForTimeout(wait(800));

    await expect(readinessCard.getByText('Technical Documentation')).toBeVisible();
    console.log('      ✓ Technical Documentation status shown');
    await page.waitForTimeout(wait(800));

    await expect(readinessCard.getByText('Risk Management')).toBeVisible();
    console.log('      ✓ Risk Management status shown');
    await page.waitForTimeout(wait(800));

    await expect(readinessCard.getByText('Governance Structure')).toBeVisible();
    console.log('      ✓ Governance status shown');
    await page.waitForTimeout(wait(1000));

    console.log('   ✅ All compliance areas verified\n');

    // ============================================
    // STEP 4: Open Export Certificate Dropdown
    // ============================================
    console.log('   🎯 Step 4: Opening export certificate menu...');

    const exportButton = readinessCard.getByTestId('certification-export-button');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    console.log('      ✓ Export button visible and enabled');
    await page.waitForTimeout(wait(1500));

    // Click export button to open dropdown
    await smoothClick(page, exportButton);
    await page.waitForTimeout(wait(1000));
    console.log('      ✓ Export menu opened');

    // Verify export options are shown
    const exportPdfOption = page.getByTestId('certification-export-pdf');
    const exportDocxOption = page.getByTestId('certification-export-docx');

    await expect(exportPdfOption).toBeVisible();
    console.log('      ✓ PDF export option shown');
    await page.waitForTimeout(wait(500));

    await expect(exportDocxOption).toBeVisible();
    console.log('      ✓ DOCX export option shown');
    await page.waitForTimeout(wait(1000));

    console.log('   ✅ Export menu displayed\n');

    // ============================================
    // STEP 5: Export Certificate as PDF
    // ============================================
    console.log('   🎯 Step 5: Exporting certification certificate as PDF...');

    // Set up download listener BEFORE clicking export
    const downloadPromise = page.waitForEvent('download', { timeout: timeout(60000) });

    // Click PDF export option
    await smoothClick(page, exportPdfOption);
    console.log('      ✓ PDF export initiated');
    await page.waitForTimeout(wait(2000));

    // Wait for download to complete
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    console.log(`      ✓ Download started: ${filename}`);

    // Verify filename format (should include date and system name)
    expect(filename).toMatch(/EU_AI_Act_Certificate_.*\.pdf/);
    console.log('      ✓ Filename format correct');

    // Wait for download to finish
    await page.waitForTimeout(wait(2000));
    console.log('   ✅ Certificate exported successfully\n');

    // ============================================
    // STEP 6: Final Dashboard View
    // ============================================
    console.log('   🎯 Step 6: Reviewing final dashboard...');

    // Scroll back to top to show complete dashboard
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    // Verify readiness badge shows "Ready for Certification"
    await expect(page.getByText(/Ready for Certification/i)).toBeVisible();
    console.log('      ✓ Certification ready badge displayed');
    await page.waitForTimeout(wait(2000));

    console.log('   ✅ Demo completed successfully\n');

    // Final pause for demo video
    await page.waitForTimeout(wait(3000));

    console.log('📹 Demo Recording Complete!\n');
  });
});

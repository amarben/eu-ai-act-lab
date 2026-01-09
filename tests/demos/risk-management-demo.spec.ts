import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, reEnableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser, seedDashboardDemoData, seedRiskManagementDemoData } from '../helpers/database';

/**
 * Full Demo: Risk Management
 *
 * This demo showcases the complete workflow for AI risk assessment and
 * mitigation action management in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - npx playwright test tests/demos/risk-management-demo.spec.ts (development - fast)
 * - DEMO_SPEED=slow npx playwright test tests/demos/risk-management-demo.spec.ts --headed (video recording)
 */

test.describe('Risk Management Module Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding dashboard demo data (AI systems)...');
    await seedDashboardDemoData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding risk management demo data (risks & mitigation actions)...');
    await seedRiskManagementDemoData('rachel.thompson@talenttech.eu');
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete risk management workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Risk Management Demo\n');

    // ==========================================
    // Scene 1: Login and Navigation
    // ==========================================
    console.log('📝 Step 1: Login to the application');
    await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
    await page.waitForTimeout(wait(2000));

    // Navigate to dashboard
    console.log('📊 Step 2: Navigate to dashboard');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to show some dashboard content
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1000));

    // ==========================================
    // Scene 2: Navigate to Risk Management
    // ==========================================
    console.log('⚠️  Step 3: Navigate to Risk Management page');
    const navRiskMgmt = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the risk management page
    await expect(page.getByRole('heading', { name: 'Risk Management' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 3: Overview of Risk Registers
    // ==========================================
    console.log('📋 Step 4: View risk register cards');
    await page.waitForTimeout(wait(2500));

    // Show risk register cards with statistics
    // Risk registers should be visible as cards
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 4: View First Risk Register Details
    // ==========================================
    console.log('🔍 Step 5: View detailed risk assessment for Customer Service AI');

    // Click on "View Details" for first system
    const viewDetailsFirst = page.getByRole('link', { name: /View Details/i }).first();
    await smoothClick(page, viewDetailsFirst);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the risk register details page
    await expect(page.getByRole('heading', { name: 'Risk Register' })).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 5: Review High-Priority Risks
    // ==========================================
    console.log('🔴 Step 6: Review high-priority risks');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Look for HIGH risk badges
    await page.waitForTimeout(wait(3000));

    // Scroll to see bias risk
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 6: View Mitigation Actions
    // ==========================================
    console.log('✅ Step 7: View mitigation actions for high-priority risk');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    // View mitigation actions section
    await page.waitForTimeout(wait(3000));

    // Check for mitigation action statuses (IN_PROGRESS, PLANNED, COMPLETED)
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 7: Review Medium and Low Risks
    // ==========================================
    console.log('📊 Step 8: Scroll through medium and low priority risks');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Show MEDIUM risk
    await page.waitForTimeout(wait(2500));

    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));

    // Show LOW risk with ACCEPT decision
    await page.waitForTimeout(wait(2500));

    // ==========================================
    // Scene 8: View Second Risk Register
    // ==========================================
    console.log('🔐 Step 9: Navigate back and view Biometric Authentication System risks');
    await page.waitForTimeout(wait(1500));

    // Navigate back to risk management page
    const navRiskMgmt2 = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt2);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Click on second risk register
    const riskAssessmentLinks = await page.getByRole('link', { name: /View Details/i }).all();
    if (riskAssessmentLinks.length >= 2) {
      await smoothClick(page, riskAssessmentLinks[1]);
      await page.waitForLoadState('networkidle');
      await reEnableCursorTracking(page);
      await page.waitForTimeout(wait(3000));

      // Verify we're viewing another risk register
      await expect(page.getByRole('heading', { name: 'Risk Register' })).toBeVisible();
      await page.waitForTimeout(wait(2000));

      // Scroll to show safety and cybersecurity risks
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(3000));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2500));

      // Show mitigation actions
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(3000));

      // ==========================================
      // Scene 9: Export Risk Register Report
      // ==========================================
      console.log('📄 Step 10: Export Risk Register Report');
      await page.waitForTimeout(wait(1500));

      // Scroll back to top to show export button
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(wait(2000));

      console.log('      🤖 Preparing to generate AI-powered risk report...');
      console.log('         ℹ️  AI will analyze risk data and generate:');
      console.log('         • Executive risk summary');
      console.log('         • Risk assessment details');
      console.log('         • Mitigation action plans');
      await page.waitForTimeout(wait(2000));

      // Set up download handler before clicking export button
      const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

      // Find and click export dropdown button (opens menu)
      const exportButton = page.getByTestId('risk-register-export-button');
      await expect(exportButton).toBeVisible();
      await smoothClick(page, exportButton);
      console.log('      ✓ Export menu opened');
      await page.waitForTimeout(wait(500));

      // Click on "Export as Word (DOCX)" menu item
      const wordExportOption = page.getByTestId('risk-register-export-docx');
      await expect(wordExportOption).toBeVisible();
      await smoothClick(page, wordExportOption);
      console.log('      ✓ Word export selected');
      await page.waitForTimeout(wait(1000));

      console.log('      ⏳ AI is generating your professional risk report...');
      console.log('         (This takes 5-10 seconds as the AI analyzes risk data)');

      // Wait for download to complete
      const download = await downloadPromise;
      await page.waitForTimeout(wait(1500));

      // Verify and save the downloaded file
      const fileName = download.suggestedFilename();
      console.log('      ✅ Report generated: ' + fileName);

      const downloadsPath = './test-results/downloads';
      await download.saveAs(`${downloadsPath}/${fileName}`);
      console.log('      ✅ Report saved to: ' + downloadsPath + '/' + fileName);
      await page.waitForTimeout(wait(2000));

      console.log('\n   📄 Report Contents:');
      console.log('      • Cover page with system information');
      console.log('      • AI-generated risk overview');
      console.log('      • Detailed risk assessments with scores');
      console.log('      • Mitigation actions with timelines');
      console.log('      • AI-powered recommendations');
      console.log('      • Ready to share with stakeholders\n');

      console.log('   ✅ Export completed successfully!\n');

      // ==========================================
      // Scene 9.5: Open and View Generated PDF Report
      // ==========================================
      console.log('📄 Step 10.5: Opening generated PDF report');
      await page.waitForTimeout(wait(1500));

      // Get the saved file path
      const savedFilePath = `${downloadsPath}/${fileName}`;
      console.log('      📂 Opening: ' + savedFilePath);

      // Open the PDF in a new page
      const pdfPage = await page.context().newPage();
      await pdfPage.goto(`file://${process.cwd()}/${savedFilePath}`);
      await enableCursorTracking(pdfPage);
      await page.waitForTimeout(wait(3000));

      console.log('      ✓ PDF report opened - showing cover page');
      await page.waitForTimeout(wait(4000));

      // Scroll through PDF to show content
      console.log('      📖 Scrolling through report sections...');
      await pdfPage.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(wait(3000));

      await pdfPage.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(wait(3000));

      await pdfPage.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(wait(3000));

      console.log('      ✅ Report preview complete\n');

      // Close PDF page and return to main page
      await pdfPage.close();
      await page.bringToFront();
      await reEnableCursorTracking(page);
      await page.waitForTimeout(wait(2000));
    }

    // ==========================================
    // Scene 10: Return to Risk Management Overview
    // ==========================================
    console.log('🏠 Step 11: Return to risk management overview');
    await page.waitForTimeout(wait(1500));

    // Navigate back to risk management page
    const navRiskMgmt3 = page.getByTestId('nav-risk-management');
    await smoothClick(page, navRiskMgmt3);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to show all risk registers
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top for final overview
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(3000));

    console.log('\n   ╔══════════════════════════════════════════════╗');
    console.log('   ║  ✅ RISK MANAGEMENT DEMO COMPLETED!         ║');
    console.log('   ╚══════════════════════════════════════════════╝\n');
    console.log('   📊 Summary:');
    console.log('      • Viewed risk management overview');
    console.log('      • Reviewed Customer Service AI risk register');
    console.log('      • Examined high-priority risks with mitigation actions');
    console.log('      • Explored Biometric Authentication System risks');
    console.log('      • Generated AI-powered risk register report');
    console.log('      • Report ready for stakeholders and auditors\n');
  });
});

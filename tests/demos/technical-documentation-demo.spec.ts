import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, reEnableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser, seedDashboardDemoData, seedTechnicalDocumentationDemoData } from '../helpers/database';

/**
 * Full Demo: Technical Documentation
 *
 * This demo showcases the complete workflow for creating and managing
 * EU AI Act Article 11 technical documentation in the EU AI Act Implementation Lab.
 *
 * Run with:
 * - npx playwright test tests/demos/technical-documentation-demo.spec.ts (development - fast)
 * - DEMO_SPEED=slow npx playwright test tests/demos/technical-documentation-demo.spec.ts --headed (video recording)
 */

test.describe('Technical Documentation Module Demo', () => {
  test.setTimeout(timeout(900000)); // 15 minutes base timeout, scales with DEMO_SPEED

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding dashboard demo data (AI systems)...');
    await seedDashboardDemoData('rachel.thompson@talenttech.eu');
    console.log('🌱 Seeding technical documentation demo data...');
    await seedTechnicalDocumentationDemoData('rachel.thompson@talenttech.eu');
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete technical documentation workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Technical Documentation Demo\n');

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
    // Scene 2: Navigate to Technical Documentation
    // ==========================================
    console.log('📄 Step 3: Navigate to Technical Documentation page');
    await page.goto('/dashboard/documentation');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the documentation page
    await expect(page.getByRole('heading', { name: 'Technical Documentation' }).first()).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 3: Overview of Documentation Stats
    // ==========================================
    console.log('📊 Step 4: View documentation statistics and list');
    await page.waitForTimeout(wait(3000));

    // Scroll to show documentation cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2500));

    // Scroll to see more documentation cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top to see stats
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(1500));

    // ==========================================
    // Scene 4: View First Documentation (100% Complete, Approved)
    // ==========================================
    console.log('✅ Step 5: View complete and approved documentation (Customer Service AI)');

    // Click on first documentation's "View & Edit" button
    const viewEditFirst = page.getByRole('link', { name: /View & Edit/i }).first();
    await smoothClick(page, viewEditFirst);
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Verify we're on the documentation detail page
    await expect(page.getByRole('heading', { name: 'Technical Documentation' }).first()).toBeVisible();
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 5: Scroll Through Documentation Sections
    // ==========================================
    console.log('📖 Step 6: Review all documentation sections');

    // Scroll to show Intended Use section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2500));

    // Scroll to show Foreseeable Misuse section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show System Architecture section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show Training Data section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show Model Performance section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show Validation Testing section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show Human Oversight section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll to show Cybersecurity section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 6: View Attachments Section
    // ==========================================
    console.log('📎 Step 7: View document attachments');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 7: View Version History
    // ==========================================
    console.log('🕐 Step 8: View version history');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(3000));

    // Scroll back to top for overview
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(2000));

    // ==========================================
    // Scene 8: Export Technical Documentation
    // ==========================================
    console.log('📄 Step 9: Export Technical Documentation Report');
    await page.waitForTimeout(wait(1500));

    console.log('      🤖 Preparing to generate AI-powered technical documentation...');
    console.log('         ℹ️  AI will analyze documentation and generate:');
    console.log('         • Executive summary');
    console.log('         • Complete Article 11 sections');
    console.log('         • Technical specifications');
    await page.waitForTimeout(wait(2000));

    // Set up download handler before clicking export button
    const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

    // Find and click export dropdown button (opens menu)
    const exportButton = page.getByTestId('technical-documentation-export-button');
    await expect(exportButton).toBeVisible();
    await smoothClick(page, exportButton);
    console.log('      ✓ Export menu opened');
    await page.waitForTimeout(wait(500));

    // Click on "Export as Word (DOCX)" menu item
    const wordExportOption = page.getByTestId('technical-documentation-export-docx');
    await expect(wordExportOption).toBeVisible();
    await smoothClick(page, wordExportOption);
    console.log('      ✓ Word export selected');
    await page.waitForTimeout(wait(1000));

    console.log('      ⏳ AI is generating your professional technical documentation...');
    console.log('         (This takes 5-10 seconds as the AI analyzes documentation data)');

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
    console.log('      • AI-generated executive summary');
    console.log('      • Complete EU AI Act Article 11 documentation');
    console.log('      • Technical specifications and architecture');
    console.log('      • Training data and model performance');
    console.log('      • Validation testing and human oversight');
    console.log('      • Ready for regulatory submission\n');

    console.log('   ✅ Export completed successfully!\n');

    // ==========================================
    // Scene 8.5: Open and View Generated PDF Report
    // ==========================================
    console.log('📄 Step 9.5: Opening generated PDF report');
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

    // ==========================================
    // Scene 9: Navigate Back to Documentation List
    // ==========================================
    console.log('🔙 Step 10: Return to documentation list');
    await page.goto('/dashboard/documentation');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // ==========================================
    // Scene 10: View Second Documentation (75% Complete, Under Review)
    // ==========================================
    console.log('⏳ Step 11: View in-progress documentation (Biometric Authentication)');

    // Scroll to see documentation cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    // Click on second documentation
    const documentationLinks = await page.getByRole('link', { name: /View & Edit/i }).all();
    if (documentationLinks.length >= 2) {
      await smoothClick(page, documentationLinks[1]);
      await page.waitForLoadState('networkidle');
      await reEnableCursorTracking(page);
      await page.waitForTimeout(wait(3000));

      // Verify we're viewing the second documentation
      await expect(page.getByRole('heading', { name: 'Technical Documentation' }).first()).toBeVisible();
      await page.waitForTimeout(wait(2000));

      // Scroll through filled sections
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      // Scroll to show incomplete sections (empty state)
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2500));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(wait(1500));
    }

    // ==========================================
    // Scene 11: View Third Documentation (37.5% Complete, Draft)
    // ==========================================
    console.log('📝 Step 12: View draft documentation (Content Moderation)');

    // Navigate back to list
    await page.goto('/dashboard/documentation');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to see documentation cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));

    // Click on third documentation
    const documentationLinks2 = await page.getByRole('link', { name: /View & Edit/i }).all();
    if (documentationLinks2.length >= 3) {
      await smoothClick(page, documentationLinks2[2]);
      await page.waitForLoadState('networkidle');
      await reEnableCursorTracking(page);
      await page.waitForTimeout(wait(3000));

      // Verify we're viewing the third documentation
      await expect(page.getByRole('heading', { name: 'Technical Documentation' }).first()).toBeVisible();
      await page.waitForTimeout(wait(2000));

      // Show the few filled sections
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2000));

      // Show empty sections
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(wait(500));
      await page.waitForTimeout(wait(2500));

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(wait(1500));
    }

    // ==========================================
    // Scene 12: Return to Documentation Overview
    // ==========================================
    console.log('🏠 Step 13: Return to documentation overview');
    await page.goto('/dashboard/documentation');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page);
    await page.waitForTimeout(wait(3000));

    // Scroll to show all documentation cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(wait(500));
    await page.waitForTimeout(wait(2000));

    // Scroll back to top for final overview
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(wait(3000));

    console.log('\n   ╔══════════════════════════════════════════════╗');
    console.log('   ║  ✅ TECHNICAL DOCUMENTATION DEMO COMPLETED! ║');
    console.log('   ╚══════════════════════════════════════════════╝\n');
    console.log('   📊 Summary:');
    console.log('      • Viewed documentation overview and statistics');
    console.log('      • Reviewed complete Customer Service AI documentation');
    console.log('      • Generated AI-powered Article 11 compliance report');
    console.log('      • Explored in-progress Biometric Authentication docs');
    console.log('      • Examined draft Content Moderation documentation');
    console.log('      • Report ready for regulatory submission\n');
  });
});

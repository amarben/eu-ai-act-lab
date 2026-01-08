import { test, expect } from '@playwright/test';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser } from '../helpers/database';
import { login } from '../helpers/auth';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';

/**
 * Gap Assessment Export Demo - Complete Workflow
 *
 * This demo showcases the complete gap assessment workflow including:
 * 1. Creating a new AI system
 * 2. Performing risk classification
 * 3. Conducting gap assessment
 * 4. Uploading evidence for requirements
 * 5. Viewing the completed assessment
 * 6. Exporting the AI-powered report
 *
 * Run with: DEMO_SPEED=slow npx playwright test tests/demos/gap-assessment-export-demo.spec.ts --headed
 */

test.describe('Gap Assessment Export - Complete Demo', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
  });

  test.beforeEach(async () => {
    console.log('🧹 Cleaning up test data (AI Systems only, keeping user)...');
    await cleanupTestData();
  });

  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('Complete Gap Assessment Workflow with Export', async ({ page, context }) => {
    logSpeedConfig();

    let gapAssessmentId: string | undefined;

    // Enable cursor tracking for professional demo appearance
    await page.addInitScript(() => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 24px;
        height: 24px;
        border: 3px solid #EF4444;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transition: all 0.1s ease;
      `;
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 12 + 'px';
        cursor.style.top = e.clientY - 12 + 'px';
      });
    });

    // Step 1: Login
    await test.step('Login to the platform', async () => {
      // Navigate to homepage first to establish context
      await page.goto('/');

      // Clear browser storage to avoid stale session issues
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Add a longer delay to ensure server is fully ready (critical with resource constraints)
      await page.waitForTimeout(wait(5000));

      await login(page, { email: 'rachel.thompson@talenttech.eu', password: 'talenttech-demo-2025' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(wait(1000));
    });

    // Step 2: Create AI System
    await test.step('Create new AI system', async () => {
      await page.click('[data-testid="nav-systems"]');
      await page.waitForTimeout(wait(1000));

      await page.click('[data-testid="add-system-button"]');
      // Wait for navigation to the new system form
      await page.waitForURL(url => url.pathname === '/dashboard/systems/new', { timeout: 10000 });
      await page.waitForTimeout(wait(1000));

      // Fill in AI system details
      await page.fill('[data-testid="system-name-input"]', 'AI-Powered Loan Approval System');
      await page.waitForTimeout(wait(500));

      await page.fill('[data-testid="system-business-purpose-textarea"]',
        'Automated credit scoring and loan approval decision support system for financial institutions');
      await page.waitForTimeout(wait(500));

      // Select primary users (at least one required)
      await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');
      await page.waitForTimeout(wait(500));

      // Select deployment status
      await page.click('[data-testid="system-deployment-status-select"]');
      await page.waitForTimeout(wait(500));
      await page.getByRole('option', { name: /PRODUCTION/i }).click();
      await page.waitForTimeout(wait(1000));

      // Add data processed (required) - use enum values
      await page.fill('[data-testid="system-data-processed-input"]', 'PERSONAL_DATA');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(wait(500));
      await page.fill('[data-testid="system-data-processed-input"]', 'SENSITIVE_DATA');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(wait(500));

      // Submit
      const submitButton = page.getByTestId('system-submit-button');
      await submitButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(wait(500));
      await submitButton.click();
      await page.waitForTimeout(wait(1000));

      // Wait for navigation to systems list page (successful submission)
      await page.waitForURL(url => url.pathname === '/dashboard/systems', { timeout: 15000 });
      await page.waitForTimeout(wait(1000));

      // Verify the system appears in the list
      await expect(page.locator('text=AI-Powered Loan Approval System')).toBeVisible();
      await page.waitForTimeout(wait(1000));
    });

    // Step 3: Perform Risk Classification
    await test.step('Classify AI system as high-risk', async () => {
      await page.click('[data-testid="nav-classification"]');
      await page.waitForTimeout(wait(1000));

      // Start classification wizard
      await page.click('text=New Classification');
      await page.waitForTimeout(wait(1000));

      // Select the AI system
      await page.click('[data-testid="classification-system-select"]');
      await page.waitForTimeout(wait(1000));
      await page.getByRole('option', { name: /AI-Powered Loan Approval System/i }).click();
      await page.waitForTimeout(wait(1000));

      await page.click('[data-testid="classification-step1-next"]');
      await page.waitForTimeout(wait(1000));

      // Answer prohibited practices questions (No to all)
      // Get all prohibited practice checkboxes and ensure they're unchecked
      const prohibitedCheckboxes = await page.locator('[data-testid^="classification-prohibited-checkbox-"]').all();
      for (const checkbox of prohibitedCheckboxes) {
        const isChecked = await checkbox.isChecked();
        if (isChecked) {
          await checkbox.click();
          await page.waitForTimeout(wait(500));
        }
      }

      await page.click('[data-testid="classification-step2-next"]');
      await page.waitForTimeout(wait(1000));

      // Select high-risk category: Access to essential services (creditworthiness)
      // The category name in the system determines the slug
      const categoryName = 'Access to essential private and public services';
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
      await page.click(`[data-testid="classification-highrisk-checkbox-${categorySlug}"]`);
      await page.waitForTimeout(wait(1000));

      await page.click('[data-testid="classification-step3-next"]');
      await page.waitForTimeout(wait(1000));

      // Confirm interaction with persons
      await page.click('[data-testid="classification-interacts-checkbox"]');
      await page.waitForTimeout(wait(1000));

      // Fill in classification reasoning (required - minimum 50 characters)
      await page.fill('[data-testid="classification-reasoning-textarea"]',
        'This loan approval system is classified as high-risk because it directly impacts access to essential financial services and creditworthiness determinations for individuals.');
      await page.waitForTimeout(wait(500));

      // Fill in applicable requirements
      await page.fill('[data-testid="classification-requirements-textarea"]',
        'Article 6 - High-Risk Classification, Article 9 - Risk Management, Article 10 - Data Governance, Article 13 - Transparency');
      await page.waitForTimeout(wait(500));

      // Click Review Classification to go to step 5
      await page.click('[data-testid="classification-step4-next"]');
      await page.waitForTimeout(wait(1000));

      // Now on review page (Step 5) - submit the classification
      const classificationSubmitButton = page.getByTestId('classification-submit-button');
      await classificationSubmitButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(wait(1000));

      // Use mouse.click to properly trigger form submission
      const box = await classificationSubmitButton.boundingBox();
      if (!box) throw new Error('Submit button not visible');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(wait(500));

      // Wait for navigation away from wizard (submission should redirect to classification details or list)
      await page.waitForURL(url => !url.pathname.includes('/new'), { timeout: 15000 });
      await page.waitForTimeout(wait(1000));

      // Verify we can see the classification result (on the classification list page)
      await expect(page.locator('text=High Risk').first()).toBeVisible();
      await page.waitForTimeout(wait(1000));
    });

    // Step 4: Navigate to Gap Assessment
    await test.step('Start gap assessment', async () => {
      // Click Gap Assessment in the sidebar to navigate to the gap assessment page
      await page.click('[data-testid="nav-gap-assessment"]');
      await page.waitForTimeout(wait(1000));

      // Select the high-risk system from dropdown
      await page.click('[data-testid="gap-assessment-system-select"]');
      await page.waitForTimeout(wait(1000));
      await page.getByRole('option', { name: /AI-Powered Loan Approval System/i }).click();
      await page.waitForTimeout(wait(1000));

      // Click "Start Assessment" button to proceed
      await page.click('[data-testid="gap-assessment-next-step"]');
      await page.waitForTimeout(wait(1000));
    });

    // Step 5: Complete Gap Assessment with Requirements
    await test.step('Assess compliance requirements', async () => {
      // Navigate through categories and update requirements
      const categories = ['risk_management', 'data_governance', 'technical_documentation'];

      for (const category of categories) {
        await page.click(`[data-testid="gap-assessment-category-${category}"]`);
        await page.waitForTimeout(wait(1000));

        // Update first requirement in each category - use keyboard navigation for shadcn Select
        // Set status to IMPLEMENTED (Not Started -> In Progress -> Implemented)
        await page.click('[data-testid="gap-assessment-requirement-0-status"]');
        await page.waitForTimeout(wait(500));
        await page.keyboard.press('ArrowDown'); // In Progress
        await page.waitForTimeout(wait(300));
        await page.keyboard.press('ArrowDown'); // Implemented
        await page.waitForTimeout(wait(300));
        await page.keyboard.press('Enter');
        await page.waitForTimeout(wait(500));

        await page.fill('[data-testid="gap-assessment-requirement-0-assigned"]', 'John Smith');
        await page.waitForTimeout(wait(500));

        await page.fill('[data-testid="gap-assessment-requirement-0-notes"]',
          'Implementation completed and documented. All controls in place.');
        await page.waitForTimeout(wait(500));

        // Mark second requirement as in progress
        await page.click('[data-testid="gap-assessment-requirement-1-status"]');
        await page.waitForTimeout(wait(500));
        await page.keyboard.press('ArrowDown'); // In Progress
        await page.waitForTimeout(wait(300));
        await page.keyboard.press('Enter');
        await page.waitForTimeout(wait(500));

        await page.fill('[data-testid="gap-assessment-requirement-1-notes"]',
          'Currently implementing. Expected completion in 2 weeks.');
        await page.waitForTimeout(wait(500));
      }

      // Scroll to bottom to find submit button
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(wait(1000));

      // Submit gap assessment - use mouse.click for React Hook Form
      const submitButton = page.getByTestId('gap-assessment-submit-button');
      await submitButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(wait(500));

      const box = await submitButton.boundingBox();
      if (!box) throw new Error('Submit button not visible');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(wait(2000)); // Increased wait after submit

      // Wait for navigation to assessment details page (increased timeout for slow mode)
      await page.waitForURL(/.*\/dashboard\/gap-assessment\/.*/, { timeout: 30000 });
      await page.waitForTimeout(wait(1000));

      // Capture assessment ID from URL
      const url = page.url();
      const match = url.match(/gap-assessment\/([^\/]+)/);
      if (match) {
        gapAssessmentId = match[1];
      }
    });

    // Step 6: View Completed Assessment
    await test.step('View completed gap assessment', async () => {
      // Should now be on the details page
      await expect(page.locator('[data-testid="gap-assessment-details-page"]')).toBeVisible();
      await page.waitForTimeout(wait(1000));

      // Verify overall score is displayed
      await expect(page.locator('[data-testid="gap-assessment-overall-score"]')).toBeVisible();
      await page.waitForTimeout(wait(1000));

      // Scroll through the assessment
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(wait(800));

      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(wait(800));
    });

    // Step 7: Export Report
    await test.step('Export AI-powered compliance report', async () => {
      // Scroll back to top
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(wait(1000));

      // Set up download handler
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      await page.click('[data-testid="gap-assessment-export-button"]');
      await page.waitForTimeout(wait(1000));

      // Wait for download to complete
      const download = await downloadPromise;
      await page.waitForTimeout(wait(1000));

      // Verify filename
      const fileName = download.suggestedFilename();
      expect(fileName).toMatch(/Gap_Assessment_.*\.docx/);

      // Save the file
      const downloadsPath = './test-results/downloads';
      await download.saveAs(`${downloadsPath}/${fileName}`);

      console.log(`✅ Report downloaded: ${fileName}`);
      await page.waitForTimeout(wait(1000) * 2);
    });

    // Step 8: Show completion message
    await test.step('Demo complete', async () => {
      console.log('\n✨ Demo Complete!');
      console.log('✅ Created AI System: AI-Powered Loan Approval System');
      console.log('✅ Performed Risk Classification: HIGH_RISK');
      console.log('✅ Completed Gap Assessment');
      console.log('✅ Exported AI-Powered Compliance Report');

      await page.waitForTimeout(wait(1000) * 3);
    });
  });
});

import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { login } from '../helpers/auth';
import { seedAdminDemoUser } from '../helpers/database';

/**
 * Risk Classification Module Demo Video
 *
 * This demo showcases the complete Risk Classification workflow for TalentTech Solutions:
 * - Creating AI systems for classification
 * - Complete classification wizard flow for all 4 risk categories
 * - Viewing risk overview cards with classification counts
 * - Reviewing classifications in the list
 */

test.describe('Risk Classification Module Demo', () => {
  let testOrgId: string;
  let adminEmail: string;

  test.beforeAll(async () => {
    // Seed TalentTech Solutions organization and Rachel Thompson user
    const user = await seedAdminDemoUser();
    testOrgId = user.organizationId;
    adminEmail = user.email;

    // Create AI systems to classify
    await prisma.aISystem.create({
      data: {
        name: 'Customer Sentiment Analyzer',
        businessPurpose:
          'Analyzes customer feedback and reviews to understand sentiment and improve products',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'PRODUCTION',
        dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
        organizationId: testOrgId,
      },
    });

    await prisma.aISystem.create({
      data: {
        name: 'Recruitment Screening AI',
        businessPurpose:
          'Automated CV screening and candidate ranking for hiring decisions',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'TESTING',
        dataCategories: ['PERSONAL_DATA'],
        organizationId: testOrgId,
      },
    });

    await prisma.aISystem.create({
      data: {
        name: 'Smart Chatbot Assistant',
        businessPurpose: 'Interactive customer support chatbot providing automated assistance',
        primaryUsers: ['EXTERNAL_CUSTOMERS'],
        deploymentStatus: 'PRODUCTION',
        dataCategories: ['PERSONAL_DATA'],
        organizationId: testOrgId,
      },
    });

    await prisma.aISystem.create({
      data: {
        name: 'Predictive Policing System',
        businessPurpose: 'Predicts crime hotspots for law enforcement resource allocation',
        primaryUsers: ['PUBLIC'],
        deploymentStatus: 'PLANNING',
        dataCategories: ['PERSONAL_DATA', 'LOCATION_DATA'],
        organizationId: testOrgId,
      },
    });
  });

  test.afterAll(async () => {
    // Cleanup
    await prisma.riskClassification.deleteMany({ where: { aiSystem: { organizationId: testOrgId } } });
    await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.user.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.organization.delete({ where: { id: testOrgId } });
  });

  test('Risk Classification Complete Workflow', async ({ page }) => {
    test.setTimeout(240000); // 4 minutes timeout for demo video

    // ==========================================
    // Scene 1: Login and Navigation
    // ==========================================
    await login(page, { email: adminEmail, password: 'talenttech-demo-2025' });
    await page.waitForTimeout(1000);

    // Navigate to Risk Classification
    await page.click('text=Risk Classification');
    await page.waitForURL('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // ==========================================
    // Scene 2: View Risk Overview Cards (All Zero)
    // ==========================================
    // Show the 4 risk category cards
    await expect(page.locator('text=Prohibited')).toBeVisible();
    await expect(page.locator('text=High Risk')).toBeVisible();
    await expect(page.locator('text=Limited Risk')).toBeVisible();
    await expect(page.locator('text=Minimal Risk')).toBeVisible();
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 3: Unclassified Systems Alert
    // ==========================================
    // Show alert about unclassified systems
    await expect(page.getByText(/You have \d+ AI system\(s\) that need risk classification/)).toBeVisible();
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 4: Classify MINIMAL_RISK System
    // ==========================================
    // Click one of the Classify Now buttons (navigates with system pre-selected)
    await page.locator('text=Classify Now').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 1: System is already selected
    await expect(page.locator('text=Step 1: Select AI System')).toBeVisible();
    await expect(page.locator('text=System Information')).toBeVisible();
    await page.waitForTimeout(1000);
    await page.click('[data-testid="classification-step1-next"]');

    // Step 2: Prohibited Practices (none)
    await expect(page.locator('text=Step 2: Prohibited Practices')).toBeVisible();
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step2-next"]');

    // Step 3: High-Risk Categories (none)
    await expect(page.locator('text=Step 3: High-Risk Categories')).toBeVisible();
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step3-next"]');

    // Step 4: Additional Questions
    await expect(page.locator('text=Step 4: Additional Questions')).toBeVisible();
    await page.waitForTimeout(500);
    await page.fill(
      '[data-testid="classification-reasoning-textarea"]',
      'This sentiment analysis system processes customer feedback data but does not interact with individuals or fall under prohibited/high-risk categories. It is used internally for product improvement purposes only.'
    );
    await page.waitForTimeout(600);
    await page.fill(
      '[data-testid="classification-requirements-textarea"]',
      'Voluntary codes of conduct recommended'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step4-next"]');

    // Step 5: Review - MINIMAL_RISK
    await expect(page.locator('text=Step 5: Review Classification')).toBeVisible();
    await expect(page.locator('text=Minimal Risk AI System')).toBeVisible();
    await page.waitForTimeout(1500);
    await page.click('[data-testid="classification-submit-button"]');
    await page.waitForURL('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 5: Classify HIGH_RISK System
    // ==========================================
    await page.click('text=New Classification');
    await page.waitForURL('/dashboard/classification/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Step 1
    await page.click('[data-testid="classification-system-select"]');
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Recruitment Screening AI/ }).click();
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step1-next"]');

    // Step 2 (skip)
    await page.waitForTimeout(600);
    await page.click('[data-testid="classification-step2-next"]');

    // Step 3: Select high-risk category
    await page.waitForTimeout(600);
    await page.click(
      '[data-testid="classification-highrisk-checkbox-employment-workers-management-and-access-to-self-employment"]'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step3-next"]');

    // Step 4
    await page.waitForTimeout(500);
    await page.click('[data-testid="classification-interacts-checkbox"]');
    await page.waitForTimeout(400);
    await page.fill(
      '[data-testid="classification-reasoning-textarea"]',
      'This recruitment AI system is used to make automated decisions affecting employment, which is explicitly listed as a high-risk use case under Annex III of the EU AI Act. It requires strict compliance with technical documentation, risk management, and human oversight requirements.'
    );
    await page.waitForTimeout(600);
    await page.fill(
      '[data-testid="classification-requirements-textarea"]',
      'Annex III, Article 9, Article 10, Article 13, Article 14, Article 52'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step4-next"]');

    // Step 5: Review - HIGH_RISK
    await expect(page.locator('text=High-Risk AI System')).toBeVisible();
    await page.waitForTimeout(1500);
    await page.click('[data-testid="classification-submit-button"]');
    await page.waitForURL('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 6: Classify LIMITED_RISK System
    // ==========================================
    await page.click('text=New Classification');
    await page.waitForURL('/dashboard/classification/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Step 1
    await page.click('[data-testid="classification-system-select"]');
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Smart Chatbot Assistant/ }).click();
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step1-next"]');

    // Step 2 (skip)
    await page.waitForTimeout(600);
    await page.click('[data-testid="classification-step2-next"]');

    // Step 3 (skip)
    await page.waitForTimeout(600);
    await page.click('[data-testid="classification-step3-next"]');

    // Step 4: Interacts with persons
    await page.waitForTimeout(500);
    await page.click('[data-testid="classification-interacts-checkbox"]');
    await page.waitForTimeout(400);
    await page.fill(
      '[data-testid="classification-reasoning-textarea"]',
      'This chatbot system interacts directly with end users (customers) by providing automated responses and assistance. While it does not fall under prohibited practices or high-risk categories, it must comply with transparency obligations under Article 52 to inform users they are interacting with an AI system.'
    );
    await page.waitForTimeout(600);
    await page.fill(
      '[data-testid="classification-requirements-textarea"]',
      'Article 52 - Transparency obligations for AI systems that interact with natural persons'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step4-next"]');

    // Step 5: Review - LIMITED_RISK
    await expect(page.locator('text=Limited Risk AI System')).toBeVisible();
    await page.waitForTimeout(1500);
    await page.click('[data-testid="classification-submit-button"]');
    await page.waitForURL('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 7: Classify PROHIBITED System
    // ==========================================
    await page.click('text=New Classification');
    await page.waitForURL('/dashboard/classification/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Step 1
    await page.click('[data-testid="classification-system-select"]');
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Predictive Policing System/ }).click();
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step1-next"]');

    // Step 2: Select prohibited practice
    await page.waitForTimeout(600);
    await page.click(
      '[data-testid="classification-prohibited-checkbox-social-scoring-by-public-authorities"]'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step2-next"]');

    // Step 3 (skip)
    await page.waitForTimeout(600);
    await page.click('[data-testid="classification-step3-next"]');

    // Step 4
    await page.waitForTimeout(500);
    await page.fill(
      '[data-testid="classification-reasoning-textarea"]',
      'This predictive policing system performs social scoring by public authorities, which is explicitly prohibited under Article 5 of the EU AI Act. Such systems pose unacceptable risks to fundamental rights and must not be deployed or used.'
    );
    await page.waitForTimeout(600);
    await page.fill(
      '[data-testid="classification-requirements-textarea"]',
      'Article 5 - Prohibited AI practices. System must not be deployed.'
    );
    await page.waitForTimeout(800);
    await page.click('[data-testid="classification-step4-next"]');

    // Step 5: Review - PROHIBITED
    await expect(page.locator('text=Prohibited AI Practice').first()).toBeVisible();
    await page.waitForTimeout(1500);
    await page.click('[data-testid="classification-submit-button"]');
    await page.waitForURL('/dashboard/classification');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ==========================================
    // Scene 8: View Risk Overview with Counts
    // ==========================================
    // Scroll to top to show all cards
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Show updated counts in cards
    await expect(page.locator('text=1').nth(0)).toBeVisible(); // Prohibited count
    await expect(page.locator('text=1').nth(1)).toBeVisible(); // High Risk count
    await page.waitForTimeout(2000);

    // ==========================================
    // Scene 9: Review Classifications List
    // ==========================================
    // Scroll down to show the classifications list
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(1000);

    // Verify all classifications are visible
    await expect(page.locator('text=Customer Sentiment Analyzer').first()).toBeVisible();
    await expect(page.locator('text=Recruitment Screening AI').first()).toBeVisible();
    await expect(page.locator('text=Smart Chatbot Assistant').first()).toBeVisible();
    await expect(page.locator('text=Predictive Policing System').first()).toBeVisible();
    await page.waitForTimeout(2000);

    // ==========================================
    // Scene 10: Final Overview
    // ==========================================
    // Scroll to top for final overview
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
  });
});

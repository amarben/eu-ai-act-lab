import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { login } from '../helpers/auth';
import { seedAdminDemoUser } from '../helpers/database';

/**
 * AI Systems Module Demo Video
 *
 * This demo showcases the complete AI Systems management workflow for TalentTech Solutions:
 * - Navigation and empty state
 * - Creating a new AI system with all required fields
 * - Viewing systems in the list
 * - Search and filter functionality
 */

test.describe('AI Systems Module Demo', () => {
  let testOrgId: string;
  let adminEmail: string;

  test.beforeAll(async () => {
    // Seed TalentTech Solutions organization and Rachel Thompson user
    const user = await seedAdminDemoUser();
    testOrgId = user.organizationId;
    adminEmail = user.email;
  });

  test.afterAll(async () => {
    // Cleanup
    await prisma.aISystem.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.user.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.organization.delete({ where: { id: testOrgId } });
  });

  test('AI Systems Management Workflow', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes timeout for demo video
    // ==========================================
    // Scene 1: Login and Navigation
    // ==========================================
    await login(page, { email: adminEmail, password: 'talenttech-demo-2025' });
    await page.waitForTimeout(1000);

    // Navigate to AI Systems from sidebar
    await page.click('text=AI Systems');
    await page.waitForURL('/dashboard/systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // ==========================================
    // Scene 2: Empty State
    // ==========================================
    // Show empty state card
    await expect(page.locator('[data-testid="empty-systems-card"]')).toBeVisible();
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 3: Create First AI System
    // ==========================================
    // Click Add AI System button
    await page.click('[data-testid="add-system-button"]');
    await page.waitForURL('/dashboard/systems/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Fill in system name
    await page.fill('[data-testid="system-name-input"]', 'Customer Service Chatbot');
    await page.waitForTimeout(500);

    // Fill in business purpose
    await page.fill(
      '[data-testid="system-business-purpose-textarea"]',
      'Automated customer support system that handles common inquiries, provides instant responses, and escalates complex issues to human agents.'
    );
    await page.waitForTimeout(500);

    // Select primary users - Internal Employees
    await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');
    await page.waitForTimeout(300);

    // Select primary users - External Customers
    await page.click('[data-testid="system-user-checkbox-EXTERNAL_CUSTOMERS"]');
    await page.waitForTimeout(500);

    // Select deployment status
    await page.click('[data-testid="system-deployment-status-select"]');
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'PRODUCTION' }).click();
    await page.waitForTimeout(500);

    // Add data categories
    const dataInput = page.locator('[data-testid="system-data-processed-input"]');

    await dataInput.fill('PERSONAL_DATA');
    await page.waitForTimeout(300);
    await dataInput.press('Enter');
    await page.waitForTimeout(500);

    await dataInput.fill('BEHAVIORAL_DATA');
    await page.waitForTimeout(300);
    await dataInput.press('Enter');
    await page.waitForTimeout(1000);

    // Submit the form
    await page.click('[data-testid="system-submit-button"]');
    await page.waitForURL('/dashboard/systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 4: View System in List
    // ==========================================
    // Verify the system appears in the list
    await expect(page.locator('text=Customer Service Chatbot').first()).toBeVisible();
    await page.waitForTimeout(1000);

    // ==========================================
    // Scene 5: Create Second AI System
    // ==========================================
    await page.click('[data-testid="add-system-button"]');
    await page.waitForURL('/dashboard/systems/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Fill in fraud detection system
    await page.fill('[data-testid="system-name-input"]', 'Fraud Detection System');
    await page.waitForTimeout(400);

    await page.fill(
      '[data-testid="system-business-purpose-textarea"]',
      'Real-time transaction monitoring and fraud detection using machine learning algorithms to identify suspicious patterns and prevent financial losses.'
    );
    await page.waitForTimeout(400);

    await page.click('[data-testid="system-user-checkbox-INTERNAL_EMPLOYEES"]');
    await page.waitForTimeout(300);

    await page.click('[data-testid="system-deployment-status-select"]');
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'PRODUCTION' }).click();
    await page.waitForTimeout(400);

    await dataInput.fill('FINANCIAL_DATA');
    await page.waitForTimeout(200);
    await dataInput.press('Enter');
    await page.waitForTimeout(300);

    await dataInput.fill('BEHAVIORAL_DATA');
    await page.waitForTimeout(200);
    await dataInput.press('Enter');
    await page.waitForTimeout(800);

    await page.click('[data-testid="system-submit-button"]');
    await page.waitForURL('/dashboard/systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 6: Create Third AI System
    // ==========================================
    await page.click('[data-testid="add-system-button"]');
    await page.waitForURL('/dashboard/systems/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    await page.fill('[data-testid="system-name-input"]', 'Recommendation Engine');
    await page.waitForTimeout(400);

    await page.fill(
      '[data-testid="system-business-purpose-textarea"]',
      'Personalized product recommendation system that analyzes customer behavior and preferences to suggest relevant products and improve conversion rates.'
    );
    await page.waitForTimeout(400);

    await page.click('[data-testid="system-user-checkbox-EXTERNAL_CUSTOMERS"]');
    await page.waitForTimeout(300);

    await page.click('[data-testid="system-deployment-status-select"]');
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'TESTING' }).click();
    await page.waitForTimeout(400);

    await dataInput.fill('PERSONAL_DATA');
    await page.waitForTimeout(200);
    await dataInput.press('Enter');
    await page.waitForTimeout(300);

    await dataInput.fill('BEHAVIORAL_DATA');
    await page.waitForTimeout(200);
    await dataInput.press('Enter');
    await page.waitForTimeout(800);

    await page.click('[data-testid="system-submit-button"]');
    await page.waitForURL('/dashboard/systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // Scene 7: View All Systems
    // ==========================================
    // Verify all three systems are displayed
    await expect(page.locator('text=Customer Service Chatbot').first()).toBeVisible();
    await expect(page.locator('text=Fraud Detection System').first()).toBeVisible();
    await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();
    await page.waitForTimeout(2000);

    // ==========================================
    // Scene 8: Search Functionality
    // ==========================================
    // Search for "Fraud"
    const searchInput = page.locator('[data-testid="systems-search-input"]');
    await searchInput.fill('Fraud');
    await page.waitForTimeout(1000);

    // Verify only Fraud Detection System is visible
    await expect(page.locator('text=Fraud Detection System').first()).toBeVisible();
    await expect(page.locator('text=Customer Service Chatbot')).not.toBeVisible();
    await page.waitForTimeout(1500);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(800);

    // Search for "Recommendation"
    await searchInput.fill('Recommendation');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();
    await expect(page.locator('text=Fraud Detection System')).not.toBeVisible();
    await page.waitForTimeout(1500);

    // Clear search to show all systems again
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Verify all systems are visible again
    await expect(page.locator('text=Customer Service Chatbot').first()).toBeVisible();
    await expect(page.locator('text=Fraud Detection System').first()).toBeVisible();
    await expect(page.locator('text=Recommendation Engine').first()).toBeVisible();
    await page.waitForTimeout(2000);

    // ==========================================
    // Scene 9: Final Overview
    // ==========================================
    // Scroll to show the full page
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
  });
});

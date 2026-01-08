import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'EU AI Act Implementation Lab' })).toBeVisible();
    await expect(page.getByText('Your practical, step-by-step guide')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learn More' })).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Risk Classification')).toBeVisible();
    await expect(page.getByText('Gap Analysis')).toBeVisible();
    await expect(page.getByText('Documentation Generator')).toBeVisible();
    await expect(page.getByText('Interactive Learning')).toBeVisible();
    await expect(page.getByText('Risk Management')).toBeVisible();
    await expect(page.getByText('Governance Framework')).toBeVisible();
  });

  test('should navigate to sign up from CTA', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Create Free Account' }).click();
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should have working feature links', async ({ page }) => {
    await page.goto('/');

    // Test a few feature links
    const classificationLink = page.getByRole('link', { name: 'Start Assessment' });
    await expect(classificationLink).toHaveAttribute('href', '/dashboard/classification');

    const gapAnalysisLink = page.getByRole('link', { name: 'Run Analysis' });
    await expect(gapAnalysisLink).toHaveAttribute('href', '/dashboard/gap-assessment');
  });
});

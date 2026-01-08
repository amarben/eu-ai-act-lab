import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display sign up page', async ({ page }) => {
    await page.goto('/auth/signup');

    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Organization Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('should show validation errors on empty sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByRole('button', { name: 'Sign In' }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/auth/signup');

    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/auth/signin');
  });
});

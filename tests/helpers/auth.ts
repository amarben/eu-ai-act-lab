import { Page } from '@playwright/test';

/**
 * Test Authentication Helper
 *
 * Provides authentication for Playwright tests
 */

export interface TestUser {
  email: string;
  password: string;
}

// Default test user - update these credentials to match your test database
export const DEFAULT_TEST_USER: TestUser = {
  email: 'admin@demo.com',
  password: 'demo-password-2025',
};

/**
 * Login to the application
 * @param page Playwright page object
 * @param user Test user credentials (optional, uses default if not provided)
 */
export async function login(page: Page, user: TestUser = DEFAULT_TEST_USER): Promise<void> {
  // Navigate to login page
  await page.goto('/auth/signin');

  // Wait for page to be fully loaded (ensures React has hydrated)
  await page.waitForLoadState('networkidle');

  // Wait for login form
  await page.waitForSelector('form');

  // Fill in credentials using id selectors
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete (successful login redirects to dashboard)
  try {
    // Wait for URL to change to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  } catch (error) {
    // Navigation didn't happen - check if there's an error alert with actual content
    const alert = await page.locator('[role="alert"]:visible').first();
    if (await alert.isVisible()) {
      const errorText = await alert.textContent();
      const trimmedError = errorText?.trim();

      // Only throw if there's actual error text (ignore empty alerts)
      if (trimmedError && trimmedError.length > 0) {
        throw new Error(`Login failed: ${trimmedError}`);
      }
    }

    // No meaningful alert found - check if we actually navigated despite the timeout
    if (page.url().includes('/dashboard')) {
      console.log('Login succeeded (on dashboard) despite timeout - continuing');
      await page.waitForLoadState('networkidle');
      return;
    }

    // Navigation really failed
    throw new Error(`Login failed: Navigation timeout. Current URL: ${page.url()}. Error: ${error}`);
  }
}

/**
 * Check if user is already logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/dashboard');
}

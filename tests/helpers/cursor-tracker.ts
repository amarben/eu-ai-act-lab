import { Page } from '@playwright/test';
import { wait } from './demo-config';

/**
 * Enable cursor tracking for professional demo appearance
 * Shows a visible cursor dot that follows mouse movements
 *
 * NOTE: This function uses page.evaluate() instead of page.addInitScript()
 * to ensure the cursor element is injected AFTER the page has loaded.
 * Call this after page.goto() and page.waitForLoadState('domcontentloaded').
 */
export async function enableCursorTracking(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Check if cursor already exists to prevent duplicates
    if (document.getElementById('demo-cursor')) {
      return;
    }

    // Create cursor dot element
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.8);
      pointer-events: none;
      z-index: 10000;
      transition: all 0.1s ease;
      transform: translate(-50%, -50%);
    `;

    // Wait for body to be available
    if (document.body) {
      document.body.appendChild(cursor);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(cursor);
      });
    }

    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    // Pulse effect on click
    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.background = 'rgba(255, 0, 0, 0.8)';
    });

    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.background = 'rgba(255, 0, 0, 0.5)';
    });
  });
}

/**
 * Re-inject cursor tracking after navigation
 * Call this after each page.goto() in demo tests to maintain cursor visibility
 *
 * Example usage:
 *   await page.goto('/dashboard');
 *   await page.waitForLoadState('domcontentloaded');
 *   await reEnableCursorTracking(page);
 */
export async function reEnableCursorTracking(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await enableCursorTracking(page);
}

/**
 * Verify that cursor tracking is active
 * Useful for debugging video recording issues
 */
export async function verifyCursorTracking(page: Page): Promise<boolean> {
  const cursorExists = await page.evaluate(() => {
    return document.getElementById('demo-cursor') !== null;
  });

  if (!cursorExists) {
    console.warn('⚠️  Cursor tracking element not found in DOM');
  } else {
    console.log('✅ Cursor tracking active');
  }

  return cursorExists;
}

/**
 * Smooth mouse movement and click
 * Moves cursor smoothly before clicking for natural appearance
 */
export async function smoothClick(page: Page, locator: any): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not visible for smooth click');
  }

  // Move to center of element
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.waitForTimeout(wait(300));
  await page.mouse.click(x, y);
  await page.waitForTimeout(wait(200));
}

/**
 * Smooth mouse movement without click
 * Useful for hovering or highlighting elements
 */
export async function smoothMoveTo(page: Page, locator: any): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not visible for smooth move');
  }

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.waitForTimeout(wait(500));
}

/**
 * Smooth typing with visible character-by-character animation
 * Perfect for demo videos to show realistic text entry
 */
export async function smoothType(
  page: Page,
  locator: any,
  text: string
): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not visible for smooth type');
  }

  // Move cursor to field and click
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.waitForTimeout(wait(200));
  await page.mouse.click(x, y);
  await page.waitForTimeout(wait(300));

  // Type with visible animation (50ms per character, scales with DEMO_SPEED)
  await locator.pressSequentially(text, { delay: wait(50) });
  await page.waitForTimeout(wait(200));
}

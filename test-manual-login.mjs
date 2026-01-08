import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:4000/auth/signin');
  
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'testpassword123');
  
  // Wait to see what happens
  await page.waitForTimeout(2000);
  
  await page.click('button[type="submit"]');
  
  // Wait longer to see result
  await page.waitForTimeout(10000);
  
  console.log('Current URL:', page.url());
  
  await browser.close();
})();

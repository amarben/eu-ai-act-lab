import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to signin page...');
  await page.goto('http://localhost:4000/auth/signin');

  console.log('Filling email...');
  await page.fill('#email', 'test@example.com');
  await page.waitForTimeout(500);

  console.log('Filling password...');
  await page.fill('#password', 'testpassword123');
  await page.waitForTimeout(500);

  console.log('Clicking submit button...');
  await page.click('button[type="submit"]');

  console.log('Waiting to observe what happens...');

  // Monitor for alerts appearing
  let alertCount = 0;
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Check for alerts every 500ms
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);

    const alerts = page.locator('[role="alert"]');
    const count = await alerts.count();
    const url = page.url();

    if (count > alertCount) {
      console.log(`\n[${i * 500}ms] New alert detected!`);
      alertCount = count;

      for (let j = 0; j < count; j++) {
        const alert = alerts.nth(j);
        const isVisible = await alert.isVisible();
        const text = await alert.textContent();
        console.log(`  Alert ${j}: visible=${isVisible}, text="${text}"`);
      }
    }

    console.log(`[${i * 500}ms] URL: ${url}`);

    if (url.includes('/dashboard')) {
      console.log('\n✅ Successfully navigated to dashboard!');
      break;
    }
  }

  console.log('\nFinal URL:', page.url());
  console.log('Keeping browser open for 5 more seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();

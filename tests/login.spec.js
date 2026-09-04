// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'test-data', 'credentials.json');

/** Takes a full-page screenshot and attaches it inline to the Playwright HTML report. */
async function captureEvidence(page, testInfo, label) {
  const buffer = await page.screenshot({ fullPage: true });
  await testInfo.attach(label, { body: buffer, contentType: 'image/png' });
}

test.describe('DemoQA — Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // DemoQA's ad slots frequently overlay form elements and cause flaky clicks.
    await page.route(/googlesyndication|doubleclick|adsbygoogle|googleads/, (route) =>
      route.abort()
    );
  });

  test('logs in successfully with a valid account and captures evidence', async ({ page }, testInfo) => {
    const { username, password } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

    await test.step('Navigate to login page', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#userName')).toBeVisible();
      await captureEvidence(page, testInfo, '01-login-page-loaded');
    });

    await test.step('Enter credentials', async () => {
      await page.locator('#userName').fill(username);
      await page.locator('#password').fill(password);
      await captureEvidence(page, testInfo, '02-credentials-entered');
    });

    await test.step('Submit login form', async () => {
      await page.locator('#login').click({ force: true });
      await page.waitForURL(/.*profile/, { timeout: 10_000 });
      await captureEvidence(page, testInfo, '03-post-login-profile-page');
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/.*profile/);
      await expect(page.locator('#userName-value')).toHaveText(username);
      await captureEvidence(page, testInfo, '04-username-verified-on-profile');
    });
  });

  test('shows an error for invalid credentials', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.locator('#userName').fill('nonexistent_user_12345');
    await page.locator('#password').fill('WrongPassword123!');
    await captureEvidence(page, testInfo, '01-invalid-credentials-entered');

    await page.locator('#login').click({ force: true });

    const errorBanner = page.locator('#output');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Invalid username or password');
    await captureEvidence(page, testInfo, '02-invalid-login-error-shown');
  });
});

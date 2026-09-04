// global-setup.js
// Registers a brand-new DemoQA account so the login test has real,
// guaranteed-valid credentials instead of a hardcoded username/password
// that could already exist or be rejected.

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'test-data', 'credentials.json');

module.exports = async () => {
  // Allow overriding with real credentials via env vars if the user
  // already has a DemoQA account they want to test against instead.
  if (process.env.DEMOQA_USERNAME && process.env.DEMOQA_PASSWORD) {
    fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
    fs.writeFileSync(
      CREDENTIALS_PATH,
      JSON.stringify({
        username: process.env.DEMOQA_USERNAME,
        password: process.env.DEMOQA_PASSWORD,
      })
    );
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Block ad iframes that commonly overlay DemoQA's UI and cause flaky clicks.
  await page.route(/googlesyndication|doubleclick|adsbygoogle|googleads/, (route) =>
    route.abort()
  );

  const stamp = Date.now();
  const username = `vibiumUser_${stamp}`;
  const password = `Test@${stamp}A1`; // meets DemoQA's password complexity rules

  await page.goto('https://demoqa.com/register', { waitUntil: 'domcontentloaded' });
  await page.locator('#firstName').fill('Vibium');
  await page.locator('#lastName').fill('Tester');
  await page.locator('#userName').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#submit').click({ force: true });

  // Registration redirects to a confirmation view; give it a moment to settle.
  await page.waitForTimeout(1500);

  await browser.close();

  fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify({ username, password }));
};

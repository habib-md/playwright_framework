# DemoQA Login Automation

A Playwright-based test framework that automates the login flow on
[demoqa.com](https://demoqa.com), captures screenshot evidence at every step,
generates an HTML execution report, and runs in GitHub Actions CI.

## How it works

1. **`global-setup.js`** registers a brand-new DemoQA account before the test
   suite runs, so the login test always has real, valid credentials.
   (You can skip this and use your own account — see below.)
2. **`tests/login.spec.js`** runs two scenarios:
   - Successful login → lands on `/profile`, verifies the username, screenshots each step.
   - Invalid login → verifies the "Invalid username or password" error banner.
3. Every step's screenshot is attached directly into the **Playwright HTML report**
   (not just saved as loose files), so you get one report with inline evidence.

## Project structure

```
demoqa-login-framework/
├── .github/workflows/playwright.yml   # CI pipeline
├── tests/login.spec.js                # Login flow tests
├── global-setup.js                    # Auto-registers a test account
├── playwright.config.js               # Reporter, screenshots, video, retries
├── package.json
└── test-data/credentials.json         # Generated at runtime (gitignored)
```

## Run locally

```bash
npm install
npx playwright install --with-deps chromium
npm test

# View the HTML report (opens in your browser)
npm run report
```

## Using your own DemoQA account instead of auto-registration

Set these before running (locally or as GitHub Actions secrets):

```bash
export DEMOQA_USERNAME="your_username"
export DEMOQA_PASSWORD="your_password"
npm test
```

If unset, `global-setup.js` automatically creates a throwaway account for you.

## Running in GitHub CI/CD

1. Push this repo (with `.github/workflows/playwright.yml`) to GitHub.
2. The workflow runs automatically on push/PR to `main`, or manually via
   **Actions → DemoQA Login Tests → Run workflow**.
3. Optional: add `DEMOQA_USERNAME` / `DEMOQA_PASSWORD` as repo secrets under
   **Settings → Secrets and variables → Actions** if you want to test against
   a specific existing account.
4. After the run finishes, download the **`playwright-report`** artifact from
   the workflow summary page and open `index.html` to see the full report
   with inline screenshots for every step.

## Notes on DemoQA's quirks

- DemoQA frequently shows ad iframes that overlay clickable elements — this
  framework blocks common ad domains (`googlesyndication`, `doubleclick`, etc.)
  to keep clicks reliable.
- Password must meet DemoQA's complexity rules (uppercase, number, special
  character) — the auto-generated password already satisfies this.

## Extending this framework

- Add more flows (e.g. registration failure cases, book store checkout) as new
  files under `tests/`.
- Swap `reporter` in `playwright.config.js` for `allure-playwright` if you want
  a richer dashboard instead of Playwright's built-in HTML report.
- To integrate with an AI agent or MCP-based tool (e.g. Vibium, Claude Code),
  point it at this repo — the plain Playwright API surface is easy for
  AI tooling to read, modify, and extend.

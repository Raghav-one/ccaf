const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.SITE_URL || 'http://127.0.0.1:4186/';
const executablePath = process.env.CHROME_PATH;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await desktop.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base + '#architecture', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.domain-link').count(), 5);
  const domains = await page.evaluate(() => Object.entries(window.SITE_CONTENT).filter(([key]) => ['architecture', 'tools-mcp', 'claude-code', 'prompting', 'reliability'].includes(key)).map(([key, track]) => ({ key, core: track.steps.length })));
  for (const domain of domains) {
    await page.goto(base + '#' + domain.key, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.domain-link.active').count(), 1, domain.key);
    assert.equal(await page.locator('.reader h1').innerText(), await page.locator('.domain-link.active strong').innerText(), domain.key);
    assert.ok(await page.locator('.concept-section').count() >= domain.core, domain.key);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, domain.key);
  }
  await page.goto(base + '#architecture', { waitUntil: 'networkidle' });
  const target = page.locator('.on-page-nav a').nth(4);
  const targetId = await target.getAttribute('data-section');
  await target.click();
  await page.waitForTimeout(1200);
  assert.ok(await page.locator('#' + targetId).evaluate(el => el.getBoundingClientRect().top < 130), 'on-page scroll');
  const code = page.locator('.code-panel').first();
  await code.scrollIntoViewIfNeeded();
  await code.locator('.code-copy').click();
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).length > 8);
  await page.screenshot({ path: '/tmp/ccaf-consolidated-desktop.png' });

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage();
  phone.on('pageerror', error => errors.push(error.message));
  await phone.goto(base + '#tools-mcp', { waitUntil: 'networkidle' });
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await phone.locator('#sidebar-toggle').click();
  await phone.waitForTimeout(250);
  assert.equal(await phone.locator('#sidebar').evaluate(el => el.classList.contains('open')), true);
  await phone.screenshot({ path: '/tmp/ccaf-consolidated-mobile-nav.png' });
  await phone.locator('.domain-link[href="#prompting"]').click();
  await phone.waitForFunction(() => document.querySelector('.reader h1')?.textContent === 'Prompt Engineering & Structured Output');
  assert.equal(await phone.locator('#sidebar').evaluate(el => el.classList.contains('open')), false);
  await phone.waitForTimeout(250);
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await phone.screenshot({ path: '/tmp/ccaf-consolidated-mobile.png' });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ domains: domains.length, desktop: 'pass', mobile: 'pass', errors }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

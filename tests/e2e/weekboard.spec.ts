import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a plan, persists it, and keeps the page free of serious accessibility issues', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan your family week together');

  await page.getByRole('button', { name: 'Add plan' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a plan' })).toBeVisible();
  await page.getByLabel('What’s happening?').fill('Dentist');
  await page.getByLabel('Place').fill('Oak Street');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Dentist/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: /Edit Dentist/ })).toBeVisible();
  // @axe-core/playwright publishes against a slightly older Playwright Page type.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors, `console errors in ${testInfo.project.name}`).toEqual([]);
});

test('dialog closes with Escape and returns focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Move / share' });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Move or share a copy' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Move or share a copy' })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('@regression:dark-demo-actions retain accessible contrast', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/demo/');
  const actions = page.locator('.demo-banner .button');
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) {
    await expect(action).toHaveCSS('background-color', 'rgb(255, 253, 243)');
    await expect(action).toHaveCSS('color', 'rgb(17, 26, 34)');
  }
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('@regression:manifest-mime serves the install manifest as JSON', async ({ page }) => {
  const response = await page.goto('/manifest.json');
  expect(response?.headers()['content-type']).toContain('application/json');
  await expect(page.locator('body')).toContainText('Weekboard');
});

test('@claim:license-restore @regression:checkout-contract accepts and verifies a returned license', async ({ page, baseURL }) => {
  const checkout = 'https://api.sociobot.in/api/v1/products/family-weekboard/checkout';
  const returnedLicense = 'returned-license-from-hosted-checkout';
  await page.route(checkout, (route) => route.fulfill({
    status: 302,
    headers: { location: new URL(`/?license=${returnedLicense}`, baseURL).href }
  }));
  await page.route(`**/products/family-weekboard/verify?license=${returnedLicense}`, (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' })
  }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Support Weekboard' }).click();
  const buy = page.getByRole('link', { name: 'Buy supporter pack' });
  await expect(buy).toHaveAttribute('href', checkout);
  await buy.click();

  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:family-weekboard'))).toBe(returnedLicense);
  await expect(page.getByRole('button', { name: 'Supporter ✓' })).toBeVisible();
});

test('reloads the installed app while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect.poll(() => page.evaluate(async () => {
    const keys = await caches.keys();
    const requests = await Promise.all(keys.map((key) => caches.open(key).then((cache) => cache.keys())));
    return requests.flat().some((request) => /^\/assets\/main-[\w-]+\.js$/.test(new URL(request.url).pathname));
  })).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan your family week together');
  await expect(page.getByText(/OFFLINE/)).toBeVisible();
  await context.setOffline(false);
});

test('mobile agenda shows one day without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  await page.goto('/');
  await expect(page.locator('.day-column:visible')).toHaveCount(1);
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  const tuesday = page.getByRole('tab').nth(1);
  await tuesday.click();
  await expect(tuesday).toHaveAttribute('aria-selected', 'true');
  await tuesday.press('ArrowRight');
  const wednesday = page.getByRole('tab').nth(2);
  await expect(wednesday).toHaveAttribute('aria-selected', 'true');
  await expect(wednesday).toBeFocused();
});

test('@regression:license-network-failure never trusts an unverified token', async ({ page }) => {
  await page.route('**/products/family-weekboard/verify?license=never-validated-token', (route) => route.abort('failed'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Support Weekboard' }).click();
  await page.getByLabel('Have a license? Paste it here').fill('never-validated-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('#licenseStatus')).toContainText('not active');
  await expect(page.getByRole('button', { name: 'Support Weekboard' })).toBeVisible();
  await expect(page.getByLabel(/Board name/)).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('sb_license_verdict:family-weekboard'))).toBeNull();
});

test.describe('calendar integrity regressions', () => {
  test.use({ timezoneId: 'America/New_York' });

  test('reopens an all-day plan on the same spring-forward civil date', async ({ page }, testInfo) => {
    await page.clock.install({ time: new Date('2027-03-13T12:00:00-05:00') });
    await page.goto('/');
    await page.getByRole('button', { name: 'Add plan' }).click();
    await page.getByLabel('What’s happening?').fill('Spring forward picnic');
    await page.getByLabel('All day').check();
    await page.getByLabel('Starts').fill('2027-03-14');
    await page.getByLabel('Ends').fill('2027-03-14');
    await page.getByRole('button', { name: 'Save plan' }).click();
    if (testInfo.project.name === 'mobile') await page.getByRole('tab', { name: 'Sun 14' }).click();
    await page.getByRole('button', { name: /Edit Spring forward picnic/ }).click();
    await expect(page.getByLabel('Ends')).toHaveValue('2027-03-14');
  });

  test('rejects inverted recurrence ranges before they can be persisted', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add plan' }).click();
    await page.getByLabel('What’s happening?').fill('Never visible');
    await page.getByLabel('Starts').fill('2026-08-28');
    await page.getByLabel('Ends').fill('2026-08-28');
    await page.getByLabel('Repeats').selectOption('daily');
    await page.getByLabel('Repeat until').fill('2026-08-27');
    await page.getByRole('button', { name: 'Save plan' }).click();
    await expect(page.getByRole('alert')).toHaveText('Repeat until must be the start date or a later date.');
    await expect(page.getByRole('dialog', { name: 'Add a plan' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit Never visible/ })).toHaveCount(0);
  });

  test('rejects whitespace-only plan titles', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add plan' }).click();
    await page.getByLabel('What’s happening?').fill('   ');
    await page.getByRole('button', { name: 'Save plan' }).click();
    await expect(page.getByRole('alert')).toHaveText('Give this plan a name, not only spaces.');
  });

  test('@regression:dst-all-day keeps a weekly all-day plan on its civil day after fall-back', async ({ page }) => {
    await page.clock.install({ time: new Date('2027-11-07T12:00:00-05:00') });
    await page.goto('/');
    await page.getByRole('button', { name: 'Add plan' }).click();
    await page.getByLabel('What’s happening?').fill('DST weekly holiday');
    await page.getByLabel('All day').check();
    await page.getByLabel('Starts').fill('2027-11-07');
    await page.getByLabel('Ends').fill('2027-11-07');
    await page.getByLabel('Repeats').selectOption('weekly');
    await page.getByLabel('Repeat until').fill('2027-11-21');
    await page.getByRole('button', { name: 'Save plan' }).click();
    await page.getByRole('button', { name: 'Next week' }).click();
    await page.getByRole('button', { name: 'Next week' }).click();
    await expect(page.locator('.event-card', { hasText: 'DST weekly holiday' })).toHaveCount(1);
    await expect(page.locator('[data-day="2027-11-21"] .event-card', { hasText: 'DST weekly holiday' })).toHaveCount(1);
    await expect(page.locator('[data-day="2027-11-15"] .event-card', { hasText: 'DST weekly holiday' })).toHaveCount(0);
  });

  test('@regression:ics-all-day-default keeps an imported spring-forward date to one day', async ({ page }) => {
    await page.clock.install({ time: new Date('2027-03-14T12:00:00-04:00') });
    await page.goto('/');
    await page.getByRole('button', { name: 'Move / share' }).click();
    await page.locator('#importIcs').setInputFiles({
      name: 'spring.ics', mimeType: 'text/calendar',
      buffer: Buffer.from('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Spring holiday\r\nDTSTART;VALUE=DATE:20270314\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n')
    });
    await expect(page.locator('.event-card', { hasText: 'Spring holiday' })).toHaveCount(1);
    await expect(page.locator('[data-day="2027-03-14"] .event-card', { hasText: 'Spring holiday' })).toHaveCount(1);
    await expect(page.locator('[data-day="2027-03-15"] .event-card', { hasText: 'Spring holiday' })).toHaveCount(0);
  });
});

test('@regression:ics-timed-until excludes a timed occurrence after the imported UTC limit', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-08-24T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: 'Move / share' }).click();
  await page.locator('#importIcs').setInputFiles({
    name: 'until.ics', mimeType: 'text/calendar',
    buffer: Buffer.from('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Evening task\r\nDTSTART:20260824T180000Z\r\nDTEND:20260824T183000Z\r\nRRULE:FREQ=DAILY;UNTIL=20260826T120000Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n')
  });
  await expect(page.locator('.event-card', { hasText: 'Evening task' })).toHaveCount(2);
  await expect(page.locator('[data-day="2026-08-26"] .event-card', { hasText: 'Evening task' })).toHaveCount(0);
});

test('@regression:csp-retry reloads the storage error page without an inline handler', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('storage-error-loads', String(Number(sessionStorage.getItem('storage-error-loads') ?? 0) + 1));
    Object.defineProperty(window, 'indexedDB', { configurable: true, get: () => { throw new Error('blocked for test'); } });
  });
  const cspErrors: string[] = [];
  page.on('console', (message) => { if (/Content Security Policy|inline event handler/i.test(message.text())) cspErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Weekboard could not open' })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('storage-error-loads'))).toBe('2');
  await expect(page.getByRole('heading', { name: 'Weekboard could not open' })).toBeVisible();
  expect(cspErrors).toEqual([]);
});

test('@regression:route-metadata gives every route complete sharing metadata and the standard shell', async ({ page }) => {
  for (const route of ['/demo/', '/privacy/', '/terms/', '/404.html']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/family-weekboard\.sociobot\.in\//);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icon-192.png');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Weekboard/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.webp$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
  }
});

test('@regression:person-whitespace explains why a person was not added', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'People' }).click();
  await page.getByLabel('Name', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Add person' }).click();
  await expect(page.locator('#peopleError')).toHaveText('Give this person a name, not only spaces.');
  await expect(page.getByRole('dialog', { name: 'People on this board' })).toBeVisible();
});

test('mobile legal pages have named links and 44px controls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  for (const route of ['/privacy/index.html', '/terms/index.html']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    const home = page.getByRole('link', { name: 'Weekboard home' });
    await expect(home).toBeVisible();
    const box = await home.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto('/');
  for (const control of [
    page.getByRole('link', { name: 'Weekboard home' }),
    page.getByRole('button', { name: 'Support Weekboard' }),
    page.getByRole('link', { name: 'Privacy' }),
    page.getByRole('link', { name: 'Terms' }),
    page.getByRole('button', { name: 'About' })
  ]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

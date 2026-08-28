import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a plan, persists it, and keeps the page free of serious accessibility issues', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our week');

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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our week');
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

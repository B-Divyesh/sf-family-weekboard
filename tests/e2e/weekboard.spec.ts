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
  await expect.poll(() => page.evaluate(async () => (await (await caches.match('/assets/app.js'))?.text())?.length ?? 0)).toBeGreaterThan(1000);
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

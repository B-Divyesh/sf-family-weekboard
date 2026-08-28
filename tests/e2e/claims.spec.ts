import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-sandbox keeps sample changes separate from the real board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Real family plan');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Real family plan/ })).toBeVisible();

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByLabel('Demo mode')).toContainText('nothing is saved');
  await expect(page.getByRole('button', { name: /Edit School drop-off/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Edit Real family plan/ })).toHaveCount(0);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).toContain('demo:weekboard-local-v1');
  expect(databases).toContain('weekboard-local-v1');

  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Temporary demo plan');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Temporary demo plan/ })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: /Edit Temporary demo plan/ })).toHaveCount(0);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('button', { name: /Edit Real family plan/ })).toBeVisible();
});

test('@claim:offline-reload reloads the sample board without a network', async ({ page, context }) => {
  await page.goto('/demo/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel('Demo mode')).toBeVisible();
  await expect(page.getByText(/OFFLINE/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Edit School drop-off/ }).first()).toBeVisible();
  await context.setOffline(false);
});

test('@claim:local-privacy sends no sample schedule off-origin', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOrigin.push(request.url());
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Private sample change');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Private sample change/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /Edit Private sample change/ })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in/i })).toHaveCount(0);
  expect(crossOrigin).toEqual([]);
});

test('@claim:ics-export downloads a standard calendar containing every sample plan', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Move / share' }).click();
  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export ICS' }).click()
  ]).then(([file]) => file);
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream!) text += chunk.toString();
  expect(text).toContain('BEGIN:VCALENDAR');
  for (const title of ['School drop-off', 'Dentist', 'Football practice', 'Groceries and meal prep']) expect(text).toContain(`SUMMARY:${title}`);
  expect((text.match(/BEGIN:VEVENT/g) ?? [])).toHaveLength(4);
});

test('@claim:encrypted-handoff encrypts the complete sample snapshot', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Move / share' }).click();
  await page.getByLabel(/Passphrase/).fill('sample secret');
  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download encrypted copy' }).click()
  ]).then(([file]) => file);
  const stream = await download.createReadStream();
  let code = '';
  for await (const chunk of stream!) code += chunk.toString();
  expect(code).toMatch(/^WB1\./);
  expect(code).not.toContain('Dentist');
  expect(code).not.toContain('Asha');
  await page.getByRole('button', { name: 'Make QR handoff' }).click();
  await expect(page.getByRole('img', { name: 'Encrypted Weekboard handoff QR code' })).toBeVisible();
});

test('@claim:installable-pwa exposes a valid manifest and controlling worker', async ({ page }) => {
  await page.goto('/demo/');
  const manifest = await page.evaluate(async () => fetch('/manifest.json').then((response) => response.json()));
  expect(manifest).toMatchObject({ display: 'standalone', start_url: '/?v=1' });
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192' }), expect.objectContaining({ sizes: '512x512', purpose: 'maskable' })]));
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('@claim:paid-checkout starts the ₹499 one-time hosted checkout', async ({ request }) => {
  const response = await request.get('https://api.sociobot.in/api/v1/products/family-weekboard/checkout', { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\//);
});

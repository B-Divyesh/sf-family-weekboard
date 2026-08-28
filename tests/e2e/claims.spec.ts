import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-sandbox keeps sample changes separate from the real board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Real family plan');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Real family plan/ })).toBeVisible();

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
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

test('@claim:ics-export downloads a standard calendar and round-trips final recurring occurrences', async ({ browser }) => {
  const senderContext = await browser.newContext({ timezoneId: 'America/New_York' });
  const page = await senderContext.newPage();
  await page.clock.install({ time: new Date('2026-08-24T12:00:00-04:00') });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Late medicine');
  await page.getByLabel('Starts').fill('2026-08-24');
  await page.getByLabel('Start time').fill('20:00');
  await page.getByLabel('Ends').fill('2026-08-24');
  await page.getByLabel('End time').fill('20:30');
  await page.getByLabel('Repeats').selectOption('daily');
  await page.getByLabel('Repeat until').fill('2026-08-26');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('School break');
  await page.getByLabel('All day').check();
  await page.getByLabel('Starts').fill('2026-08-24');
  await page.getByLabel('Ends').fill('2026-08-24');
  await page.getByLabel('Repeats').selectOption('daily');
  await page.getByLabel('Repeat until').fill('2026-08-26');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await page.getByRole('button', { name: 'Share or export board' }).click();
  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export ICS' }).click()
  ]).then(([file]) => file);
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream!) text += chunk.toString();
  expect(text).toContain('BEGIN:VCALENDAR');
  for (const title of ['School drop-off', 'Dentist', 'Football practice', 'Groceries and meal prep']) expect(text).toContain(`SUMMARY:${title}`);
  // The four shipped sample plans plus both boundary-regression plans export.
  expect((text.match(/BEGIN:VEVENT/g) ?? [])).toHaveLength(6);
  expect(text).toMatch(/DTSTART:\d{8}T\d{6}Z/);
  expect(text).toContain('RRULE:FREQ=DAILY');
  expect(text).toContain('RRULE:FREQ=WEEKLY');
  expect(text).toContain('DTSTART:20260825T000000Z');
  expect(text).toContain('RRULE:FREQ=DAILY;UNTIL=20260827T000000Z');
  expect(text).toContain('DTSTART;VALUE=DATE:20260824');
  expect(text).toContain('RRULE:FREQ=DAILY;UNTIL=20260826');

  const receiverContext = await browser.newContext({ timezoneId: 'America/New_York' });
  const receiver = await receiverContext.newPage();
  await receiver.clock.install({ time: new Date('2026-08-24T12:00:00-04:00') });
  await receiver.goto('/');
  await receiver.getByRole('button', { name: 'Share or export board' }).click();
  await receiver.locator('#importIcs').setInputFiles({ name: 'weekboard.ics', mimeType: 'text/calendar', buffer: Buffer.from(text) });
  // On phones only the selected day is visible, so inspect the board's three
  // rendered recurrence cards rather than its visible accessibility tree.
  await expect(receiver.locator('.event-card').filter({ hasText: 'Late medicine' })).toHaveCount(3);
  await expect(receiver.locator('.event-card').filter({ hasText: 'School break' })).toHaveCount(3);
  await senderContext.close();
  await receiverContext.close();
});

test('@claim:encrypted-handoff encrypts the complete sample snapshot', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOrigin.push(request.url());
  });
  await page.addInitScript(() => {
    const encrypt = SubtleCrypto.prototype.encrypt;
    SubtleCrypto.prototype.encrypt = function (algorithm, key, data) {
      sessionStorage.setItem('weekboard-encryption-algorithm', typeof algorithm === 'string' ? algorithm : algorithm.name);
      return encrypt.call(this, algorithm, key, data);
    };
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Share or export board' }).click();
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
  expect(await page.evaluate(() => sessionStorage.getItem('weekboard-encryption-algorithm'))).toBe('AES-GCM');
  await page.getByRole('button', { name: 'Make QR copy' }).click();
  await expect(page.getByRole('img', { name: 'Encrypted Weekboard copy QR code' })).toBeVisible();
  await page.getByRole('button', { name: 'Close sharing and export' }).click();
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Mutation to replace');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await page.getByRole('button', { name: 'Share or export board' }).click();
  await page.getByLabel(/Passphrase/).fill('sample secret');
  await page.getByLabel('Or paste a copy code').fill(code);
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Replace this board with “Patel family week” (4 plans)?');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Open pasted copy' }).click();
  await expect(page.getByRole('button', { name: /Edit Mutation to replace/ })).toHaveCount(0);
  await expect(page.locator('.event-card', { hasText: 'Dentist' })).toHaveCount(1);
  expect(crossOrigin).toEqual([]);
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

test('@claim:paid-checkout displays ₹499 once and starts the hosted checkout', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.supporter-section')).toContainText('₹499 once.');
  await page.getByRole('button', { name: 'See supporter pack' }).click();
  await expect(page.locator('.price')).toHaveText(/₹499\s+one time/);
  await expect(page.getByRole('listitem').filter({ hasText: 'No subscription' })).toBeVisible();
  // A cold request used to fail intermittently. Require repeated redirects,
  // not a lucky single response, before accepting the hosted purchase claim.
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await request.get('https://api.sociobot.in/api/v1/products/family-weekboard/checkout', { maxRedirects: 0 });
    expect(response.status()).toBe(303);
    expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\//);
  }
});

test('@claim:free-core keeps planning, printing, and both exports available without a license', async ({ page }) => {
  await page.addInitScript(() => { window.print = () => sessionStorage.setItem('weekboard-print-opened', 'yes'); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add plan' }).click();
  await page.getByLabel('What’s happening?').fill('Free family plan');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: /Edit Free family plan/ })).toBeVisible();
  await page.getByRole('button', { name: 'Print week' }).click();
  expect(await page.evaluate(() => sessionStorage.getItem('weekboard-print-opened'))).toBe('yes');
  await page.getByRole('button', { name: 'Share or export board' }).click();
  const ics = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export ICS' }).click();
  expect((await ics).suggestedFilename()).toMatch(/\.ics$/);
  await page.getByLabel(/Passphrase/).fill('free export passphrase');
  const encrypted = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted copy' }).click();
  expect((await encrypted).suggestedFilename()).toMatch(/\.weekboard$/);
});

test('@claim:ics-import imports a standard calendar plan into the board', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-08-24T12:00:00Z') });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Share or export board' }).click();
  await page.locator('#importIcs').setInputFiles({
    name: 'family.ics', mimeType: 'text/calendar',
    buffer: Buffer.from('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:import-claim\r\nSUMMARY:Imported school meeting\r\nDTSTART:20260825T130000Z\r\nDTEND:20260825T140000Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n')
  });
  await expect(page.locator('.event-card', { hasText: 'Imported school meeting' })).toHaveCount(1);
  await expect(page.locator('#statusLine')).toContainText('1 plan imported from ICS.');
});

test('@claim:calendar-options handles all-day, daily, weekly, and monthly plans', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-08-24T12:00:00Z') });
  await page.goto('/demo/');

  const addPlan = async (title: string, recurrence: 'none' | 'daily' | 'weekly' | 'monthly', until?: string, allDay = false) => {
    await page.getByRole('button', { name: 'Add plan' }).click();
    await page.getByLabel('What’s happening?').fill(title);
    await page.getByLabel('Starts').fill('2026-08-24');
    await page.getByLabel('Ends').fill('2026-08-24');
    if (allDay) await page.getByLabel('All day').check();
    await page.getByLabel('Repeats').selectOption(recurrence);
    if (until) await page.getByLabel('Repeat until').fill(until);
    await page.getByRole('button', { name: 'Save plan' }).click();
  };

  await addPlan('All-day claim', 'none', undefined, true);
  await expect(page.getByRole('button', { name: /Edit All-day claim, All day/ })).toBeVisible();
  await addPlan('Daily claim', 'daily', '2026-08-26');
  await expect(page.locator('.event-card', { hasText: 'Daily claim' })).toHaveCount(3);
  await addPlan('Weekly claim', 'weekly', '2026-09-30');
  await addPlan('Monthly claim', 'monthly', '2026-09-30');
  await page.getByRole('button', { name: 'Next week' }).click();
  await expect(page.locator('.event-card', { hasText: 'Weekly claim' })).toHaveCount(1);
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Next week' }).click();
  await expect(page.locator('[data-day="2026-09-24"] .event-card', { hasText: 'Monthly claim' })).toHaveCount(1);
});

test('@claim:person-lanes shows names and distinct lane colours', async ({ page }) => {
  await page.goto('/demo/');
  for (const name of ['Asha', 'Ravi', 'Kids']) {
    await expect(page.locator('.event-card', { hasText: name }).first()).toHaveAttribute('style', /--lane:#[0-9a-f]{6}/i);
  }
  const colours = await page.locator('.event-card').evaluateAll((cards) => [...new Set(cards.map((card) => (card as HTMLElement).style.getPropertyValue('--lane'))) ]);
  expect(colours.length).toBeGreaterThanOrEqual(3);
});

test('@claim:responsive-agenda shows seven desktop days and one phone day', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/');
  await expect(page.locator('.day-column:visible')).toHaveCount(7);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.day-column:visible')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('@claim:print-board opens printing with all seven days laid out', async ({ page }) => {
  await page.addInitScript(() => { window.print = () => sessionStorage.setItem('weekboard-print-opened', 'yes'); });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Print week' }).click();
  expect(await page.evaluate(() => sessionStorage.getItem('weekboard-print-opened'))).toBe('yes');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.day-column:visible')).toHaveCount(7);
  await expect(page.locator('.topbar')).toBeHidden();
  expect(await page.locator('.week-grid').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(7);
});

test('@claim:themes applies and remembers system, light, and dark themes', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
  await page.getByRole('button', { name: 'Change colour theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Change colour theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Change colour theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
});

test('@claim:supporter-entitlements enables a custom name, extra colours, and more than four people', async ({ page }) => {
  const token = 'supporter-entitlements-license';
  await page.route(`**/products/family-weekboard/verify?license=${token}`, (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.addInitScript((license) => localStorage.setItem('sb_license:family-weekboard', license), token);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Manage supporter pack' })).toBeVisible();
  for (const name of ['Asha', 'Ravi', 'Kids', 'Grandma']) {
    await page.getByRole('button', { name: 'Edit people', exact: true }).click();
    await page.getByLabel('Name', { exact: true }).fill(name);
    if (name === 'Grandma') {
      const colour = page.locator('select[name="personColor"]');
      await expect(colour.locator('option').nth(4)).toBeEnabled();
      await colour.selectOption({ index: 4 });
    }
    await page.getByRole('button', { name: 'Add person' }).click();
  }
  await page.getByRole('button', { name: 'Edit people', exact: true }).click();
  await expect(page.locator('.people-list li')).toHaveCount(5);
  await page.getByLabel('Board name').fill('The Rao board');
  await page.getByRole('button', { name: 'Save name' }).click();
  await expect(page.locator('.masthead .eyebrow')).toContainText('The Rao board');
});

test('@claim:license-revocation locks supporter extras after a revoked verdict', async ({ page }) => {
  const token = 'revoked-supporter-license';
  await page.addInitScript(({ license, checkedAt }) => {
    localStorage.setItem('sb_license:family-weekboard', license);
    localStorage.setItem('sb_license_verdict:family-weekboard', JSON.stringify({ valid: true, checkedAt, token: license }));
  }, { license: token, checkedAt: Date.now() - 90_000_000 });
  await page.route(`**/products/family-weekboard/verify?license=${token}`, (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' })
  }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Support Weekboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit people' }).click();
  await expect(page.getByLabel('Board name')).toBeDisabled();
});

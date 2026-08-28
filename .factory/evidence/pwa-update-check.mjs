import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = join(process.cwd(), 'dist');
let updated = false;
let workerRequests = 0;
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.xml': 'text/xml', '.txt': 'text/plain'
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    let path = url.pathname;
    if (path === '/') path = '/index.html';
    if (path.endsWith('/')) path += 'index.html';
    let file = join(root, path);
    if (!(await stat(file)).isFile()) throw new Error('not found');
    let body = await readFile(file);
    if (path === '/sw.js') {
      workerRequests++;
      if (updated) body = Buffer.from(body.toString().replace('weekboard-shell-', 'weekboard-shell-qa-update-'));
      response.setHeader('Cache-Control', 'no-store');
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream');
    response.end(body);
  } catch {
    response.statusCode = 404;
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(4199, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4199/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload({ waitUntil: 'networkidle' });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  updated = true;
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
  await expect(page.getByText('A fresh Weekboard is ready.')).toBeVisible();
  await page.getByRole('button', { name: 'Reload' }).click();
  await page.waitForLoadState('networkidle');
  const caches = await page.evaluate(() => window.caches.keys());
  console.log(JSON.stringify({ updateToast: true, reloaded: true, workerRequests, caches }, null, 2));
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

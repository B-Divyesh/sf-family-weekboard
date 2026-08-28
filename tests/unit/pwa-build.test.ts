import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readRelease(dist: string): { cache: string; assets: string[] } {
  const worker = readFileSync(join(dist, 'sw.js'), 'utf8');
  const cache = worker.match(/const CACHE = '([^']+)'/)?.[1];
  const assets = worker.match(/const ASSETS = (\[[^\n]+\]);/)?.[1];
  if (!cache || !assets) throw new Error('The generated worker does not contain a cache revision and precache list.');
  return { cache, assets: JSON.parse(assets) as string[] };
}

describe('production PWA build', () => {
  it('serves a declared manifest through the host JSON MIME mapping', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      routes: Array<{ route: string; headers?: Record<string, string> }>;
    };
    const manifestRoute = config.routes.find((route) => route.route === '/manifest.json');
    expect(manifestRoute?.headers?.['Cache-Control']).toBe('no-cache');
    expect(readFileSync('index.html', 'utf8')).toContain('href="/manifest.json"');
  });

  it('ships discovery metadata and a true static 404 policy', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback?: unknown;
      responseOverrides?: Record<string, { rewrite: string; statusCode: number }>;
    };
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    const html = readFileSync('index.html', 'utf8');
    for (const marker of ['rel="canonical"', 'property="og:image"', 'name="twitter:card"', 'rel="apple-touch-icon"']) expect(html).toContain(marker);
    expect(readFileSync('public/robots.txt', 'utf8')).toContain('Sitemap: https://family-weekboard.sociobot.in/sitemap.xml');
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://family-weekboard.sociobot.in/privacy/</loc>');
  });

  it('revisions the worker and precache URLs whenever application code changes', () => {
    const sandbox = mkdtempSync(join(tmpdir(), 'weekboard-pwa-'));
    try {
      for (const path of ['src', 'public', 'assets', 'index.html', '404.html', 'demo', 'privacy', 'terms', 'vite.config.ts', 'tsconfig.json']) {
        cpSync(resolve(path), join(sandbox, path), { recursive: true });
      }
      symlinkSync(resolve('node_modules'), join(sandbox, 'node_modules'), 'dir');
      const vite = resolve('node_modules/vite/bin/vite.js');
      const build = (outDir: string) => execFileSync(process.execPath, [vite, 'build', '--outDir', outDir], { cwd: sandbox, stdio: 'pipe' });

      build('release-one');
      const first = readRelease(join(sandbox, 'release-one'));
      const app = join(sandbox, 'src/app.ts');
      writeFileSync(app, readFileSync(app, 'utf8').replace('Plan added.', 'Plan saved.'));
      build('release-two');
      const second = readRelease(join(sandbox, 'release-two'));

      expect(second.cache).not.toBe(first.cache);
      const firstApp = first.assets.find((asset) => /^\/assets\/main-[\w-]+\.js$/.test(asset));
      const secondApp = second.assets.find((asset) => /^\/assets\/main-[\w-]+\.js$/.test(asset));
      expect(firstApp).toBeTruthy();
      expect(secondApp).toBeTruthy();
      expect(secondApp).not.toBe(firstApp);
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  }, 30_000);
});

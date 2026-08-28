import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

function filesIn(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

function serviceWorkerBuildPlugin() {
  let outDir = resolve(__dirname, 'dist');
  return {
    name: 'weekboard-service-worker-build',
    configResolved(config: { build: { outDir: string } }) { outDir = config.build.outDir; },
    closeBundle() {
      const dist = outDir;
      const template = readFileSync(resolve(__dirname, 'public/sw.js'), 'utf8');
      const precache = [
        '/', '/index.html', '/offline.html', '/manifest.webmanifest',
        '/icon.svg', '/icon-192.png', '/icon-512.png', '/privacy/', '/privacy/index.html', '/terms/', '/terms/index.html',
        ...filesIn(join(dist, 'assets')).map((file) => `/${relative(dist, file).replaceAll('\\', '/')}`)
      ].sort();
      const releaseFiles = filesIn(dist).filter((file) => !file.endsWith('.map') && !file.endsWith('/sw.js')).sort();
      const revision = createHash('sha256')
        .update(template)
        .update(releaseFiles.map((file) => `${relative(dist, file)}:${readFileSync(file)}`).join('\n'))
        .digest('hex').slice(0, 16);
      writeFileSync(join(dist, 'sw.js'), template
        .replace('__WEEKBOARD_CACHE__', `weekboard-shell-${revision}`)
        .replace('__WEEKBOARD_PRECACHE__', JSON.stringify(precache)));
    }
  };
}

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html')
      },
      output: { assetFileNames: 'assets/[name]-[hash][extname]' }
    }
  },
  plugins: [serviceWorkerBuildPlugin()],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] }
});

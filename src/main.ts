import './style.css';
import { WeekboardApp } from './app';
import { BoardStore } from './db';
import { captureLicenseFromUrl } from './license';
import { announceRoute } from './route-focus';

async function start(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app')!;
  // Keep the catalog's one-click URL working as well as the shareable /demo/
  // route. Both paths deliberately select the demo-only IndexedDB database.
  const demo = location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';
  if (!demo) captureLicenseFromUrl();
  document.title = demo ? 'Demo — Weekboard' : 'Weekboard — plan your family week';
  if (demo) {
    const description = 'Try Weekboard with a separate sample family schedule.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', location.pathname === '/' ? 'https://family-weekboard.sociobot.in/?demo=1' : 'https://family-weekboard.sociobot.in/demo/');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Demo — Weekboard');
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Weekboard');
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', location.pathname === '/' ? 'https://family-weekboard.sociobot.in/?demo=1' : 'https://family-weekboard.sociobot.in/demo/');
  }
  try {
    const store = await BoardStore.create(demo);
    await new WeekboardApp(root, store, demo).init();
    announceRoute();
  } catch (error) {
    console.error(error);
    root.innerHTML = `<main id="main" class="fatal"><h1>Weekboard could not open</h1><p>Your browser blocked local storage, so no plans can be safely saved.</p><p>Allow site data for this page, or open it in a regular (not private) window, then reload.</p><button id="retryOpen" type="button">Try again</button></main>`;
    root.querySelector('#retryOpen')?.addEventListener('click', () => location.reload());
  }
}

void start();

// Browser back/forward can restore this document from its page cache without
// rerunning start(), so restore the same heading orientation on pageshow.
window.addEventListener('pageshow', () => announceRoute());

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            const toast = document.querySelector<HTMLElement>('#updateToast');
            if (toast) {
              toast.hidden = false;
              toast.querySelector('button')?.addEventListener('click', () => location.reload());
            }
          }
        });
      });
    }).catch(() => { /* The app remains usable without install support. */ });
  });
}

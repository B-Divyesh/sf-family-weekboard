import './style.css';
import { WeekboardApp } from './app';
import { BoardStore } from './db';
import { captureLicenseFromUrl } from './license';

async function start(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app')!;
  const demo = location.pathname === '/demo' || location.pathname === '/demo/';
  if (!demo) captureLicenseFromUrl();
  document.title = demo ? 'Demo — Weekboard' : 'Weekboard — plan your family week';
  try {
    const store = await BoardStore.create(demo);
    await new WeekboardApp(root, store, demo).init();
  } catch (error) {
    console.error(error);
    root.innerHTML = `<main id="main" class="fatal"><h1>Weekboard could not open</h1><p>Your browser blocked local storage, so no plans can be safely saved.</p><p>Allow site data for this page, or open it in a regular (not private) window, then reload.</p><button onclick="location.reload()">Try again</button></main>`;
  }
}

void start();

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

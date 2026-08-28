/** Give document-route changes the same orientation as an in-app route change. */
export function announceRoute(): void {
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!heading) return;
  heading.tabIndex = -1;
  let live = document.querySelector<HTMLElement>('#routeAnnouncement');
  if (!live) {
    live = document.createElement('p');
    live.id = 'routeAnnouncement';
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    document.body.append(live);
  }
  // A timeout lets assistive technology receive the new document before its
  // title and heading are announced.
  window.setTimeout(() => {
    heading.focus({ preventScroll: true });
    live!.textContent = document.title;
  }, 0);
}

if (!document.querySelector('#app')) {
  window.addEventListener('pageshow', () => announceRoute());
}

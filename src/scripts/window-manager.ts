/**
 * Michelle OS window manager.
 *
 * Every page server-renders the full desktop plus its own windows. Once this
 * script runs, the desktop persists: links to other pages fetch that page
 * and add its windows to the current desktop instead of reloading, the URL
 * follows the focused window, and Back/Forward reopen or refocus windows.
 *
 * Windows (see components/Window.astro) can be dragged, focused, closed,
 * minimized into the dock, and zoomed. On narrow screens app windows open
 * full screen over the home screen instead.
 */
import { initFilters } from './sidebar-filter';

const WIDE = window.matchMedia('(min-width: 1100px)');
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const DOCK_CLEARANCE = 96; // px kept free above the floating dock
const CASCADE_STEP = 28;
const DEFAULT_TITLE = document.title;

type OpenOptions = { push: boolean; origin?: Element | null };

const desktop = document.querySelector<HTMLElement>('[data-desktop]');
const appNameEl = document.querySelector<HTMLElement>('[data-app-name]');
const dockMinimized = document.querySelector<HTMLElement>('[data-dock-minimized]');

let topZ = 10;
let cascade = 0;
const pages = new Map<string, Promise<Document | null>>();

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
const allWindows = () => Array.from(desktop?.querySelectorAll<HTMLElement>(':scope > [data-window]') ?? []);
const isShown = (win: HTMLElement) => !win.classList.contains('is-minimized');
const animate = () => !REDUCED_MOTION.matches;

if (desktop) boot(desktop);

function boot(root: HTMLElement) {
  // Seed the cache with this page before anything is wired up, so reopening
  // one of its windows later imports clean markup without another request.
  const initialRoute = normalize(location.pathname);
  pages.set(initialRoute, Promise.resolve(document.cloneNode(true) as Document));

  allWindows().forEach(setupWindow);
  initFilters(root);

  const initial =
    allWindows().find((win) => win.dataset.route === initialRoute && win.dataset.kind === 'app') ??
    allWindows().find((win) => win.hasAttribute('data-primary')) ??
    allWindows().at(-1);
  if (initial) focusWindow(initial, { updateUrl: false });
  updateChrome();

  document.addEventListener('click', onLinkClick);
  document.addEventListener('pointerover', onLinkIntent, { passive: true });
  document.addEventListener('focusin', onLinkIntent);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('popstate', () => openRoute(location.pathname, { push: false }));
  WIDE.addEventListener('change', resetGeometry);

  history.replaceState({ os: true }, '', location.href);
}

/* ---------- Window lifecycle ---------- */

function setupWindow(win: HTMLElement) {
  if (win.dataset.wmReady) return;
  win.dataset.wmReady = 'true';
  win.tabIndex = -1;

  win.addEventListener('pointerdown', () => focusWindow(win));

  win.querySelector('[data-close]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeWindow(win);
  });
  win.querySelector('[data-minimize]')?.addEventListener('click', (event) => {
    event.stopPropagation();
    minimizeWindow(win);
  });
  win.querySelector('[data-zoom]')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleZoom(win);
  });

  const handle = win.querySelector<HTMLElement>('[data-drag]');
  handle?.addEventListener('dblclick', (event) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    toggleZoom(win);
  });
  handle?.addEventListener('pointerdown', (event) => startDrag(win, handle, event));

  initFilters(win);
}

function focusWindow(win: HTMLElement, { updateUrl = true } = {}) {
  allWindows().forEach((other) => other.classList.toggle('is-focused', other === win));
  win.style.zIndex = String(++topZ);

  if (updateUrl) {
    const route = win.dataset.route ?? '/';
    if (normalize(location.pathname) !== route) history.replaceState(history.state, '', route);
  }
  document.title = win.dataset.docTitle || DEFAULT_TITLE;
  updateChrome();
}

function focusTopWindow() {
  const shown = allWindows().filter(isShown);
  const top = shown.sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];
  if (top) {
    focusWindow(top);
    top.focus({ preventScroll: true });
    return;
  }
  // Nothing left open: an empty desktop lives at "/".
  if (normalize(location.pathname) !== '/') history.replaceState(history.state, '', '/');
  document.title = DEFAULT_TITLE;
  updateChrome();
}

function closeWindow(win: HTMLElement) {
  const finish = () => {
    removeDockTile(win);
    win.remove();
    focusTopWindow();
    // A phone home screen should never be empty: bring the desktop back.
    if (!WIDE.matches && allWindows().length === 0) openRoute('/', { push: false });
  };
  if (!animate()) return finish();
  win.animate(
    [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.96)' }],
    { duration: 150, easing: 'ease-in' },
  ).finished.then(finish, finish);
}

function minimizeWindow(win: HTMLElement) {
  const tile = addDockTile(win);
  const finish = () => {
    win.classList.add('is-minimized');
    win.classList.remove('is-focused');
    focusTopWindow();
  };
  if (!animate()) return finish();
  const from = win.getBoundingClientRect();
  const to = tile.getBoundingClientRect();
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const scale = Math.max(0.05, to.width / from.width);
  win.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2 },
    ],
    { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  ).finished.then(finish, finish);
}

function restoreWindow(win: HTMLElement) {
  const tile = dockMinimized?.querySelector<HTMLElement>(`[data-restore="${win.dataset.window}"]`);
  const to = tile?.getBoundingClientRect();
  removeDockTile(win);
  win.classList.remove('is-minimized');
  focusWindow(win);
  if (to && animate()) {
    const from = win.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    win.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${Math.max(0.05, to.width / from.width)})`, opacity: 0.2 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  }
}

function toggleZoom(win: HTMLElement) {
  if (!WIDE.matches) return;
  win.classList.add('is-animating');
  win.classList.toggle('is-zoomed');
  window.setTimeout(() => win.classList.remove('is-animating'), 260);
  focusWindow(win);
}

/* ---------- Dragging ---------- */

function startDrag(win: HTMLElement, handle: HTMLElement, event: PointerEvent) {
  if (!WIDE.matches || event.button !== 0) return;
  if ((event.target as HTMLElement).closest('button, a')) return;
  if (win.classList.contains('is-zoomed')) return;
  const root = desktop!;
  const offsetX = event.clientX - win.offsetLeft;
  const offsetY = event.clientY - win.offsetTop;
  handle.setPointerCapture(event.pointerId);
  win.classList.add('is-dragging');

  const move = (e: PointerEvent) => {
    const maxX = root.clientWidth - 80;
    const maxY = root.clientHeight - 40;
    win.style.left = `${Math.min(Math.max(e.clientX - offsetX, -win.offsetWidth + 80), maxX)}px`;
    win.style.top = `${Math.min(Math.max(e.clientY - offsetY, 0), maxY)}px`;
  };
  const stop = () => {
    win.classList.remove('is-dragging');
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', stop);
    handle.removeEventListener('pointercancel', stop);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
}

/** Offset each newly opened app window so stacked windows stay visible. */
function cascadeWindow(win: HTMLElement) {
  if (!WIDE.matches || win.dataset.kind !== 'app') return;
  const step = (cascade++ % 6) * CASCADE_STEP;
  if (step === 0) return;
  const root = desktop!;
  const left = Math.min(win.offsetLeft + step, root.clientWidth - win.offsetWidth - 16);
  const top = Math.min(win.offsetTop + step, root.clientHeight - DOCK_CLEARANCE - win.offsetHeight);
  win.style.left = `${Math.max(16, left)}px`;
  win.style.top = `${Math.max(16, top)}px`;
}

function resetGeometry() {
  allWindows().forEach((win) => {
    win.style.left = '';
    win.style.top = '';
    win.classList.remove('is-zoomed');
  });
}

/* ---------- Dock ---------- */

function addDockTile(win: HTMLElement): HTMLElement {
  const id = win.dataset.window!;
  let tile = dockMinimized?.querySelector<HTMLElement>(`[data-restore="${id}"]`) ?? null;
  if (tile || !dockMinimized) return tile ?? win;
  tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'dock-item dock-min';
  tile.dataset.restore = id;
  const title = win.getAttribute('aria-label') || win.querySelector('.win-title')?.textContent || 'Window';
  tile.setAttribute('aria-label', `Restore ${title}`);
  tile.innerHTML = `
    <span class="dock-icon" style="background: ${win.dataset.iconColor}">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${win.dataset.iconGlyph}" /></svg>
    </span>
    <span class="dock-tip"></span>`;
  tile.querySelector('.dock-tip')!.textContent = title;
  tile.addEventListener('click', () => restoreWindow(win));
  dockMinimized.append(tile);
  dockMinimized.hidden = false;
  return tile;
}

function removeDockTile(win: HTMLElement) {
  dockMinimized?.querySelector(`[data-restore="${win.dataset.window}"]`)?.remove();
  if (dockMinimized && !dockMinimized.querySelector('[data-restore]')) dockMinimized.hidden = true;
}

/** Running dots, the menu bar app name, and the active menu item. */
function updateChrome() {
  const open = allWindows();
  const matches = (route: string, target: string) =>
    target === '/' ? route === '/' : route === target || route.startsWith(`${target}/`);

  document.querySelectorAll<HTMLElement>('[data-dock-route]').forEach((item) => {
    const target = item.dataset.dockRoute!;
    item.classList.toggle('running', open.some((win) => matches(win.dataset.route ?? '', target)));
  });

  const focused = open.find((win) => win.classList.contains('is-focused') && isShown(win));
  if (appNameEl) appNameEl.textContent = focused?.dataset.app ?? 'Michelle OS';

  const focusedRoute = focused?.dataset.route ?? '';
  document.querySelectorAll<HTMLElement>('[data-nav-route]').forEach((link) => {
    const active = matches(focusedRoute, link.dataset.navRoute!) && focusedRoute !== '/';
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Lock page scroll behind a full-screen app on phones.
  document.body.classList.toggle(
    'app-open',
    open.some((win) => win.dataset.kind === 'app' && isShown(win)),
  );
}

/* ---------- Navigation ---------- */

function fetchPage(route: string): Promise<Document | null> {
  let page = pages.get(route);
  if (!page) {
    page = fetch(route, { credentials: 'same-origin' })
      .then((response) => {
        const type = response.headers.get('content-type') ?? '';
        return type.includes('text/html') ? response.text() : null;
      })
      .then((html) => (html ? new DOMParser().parseFromString(html, 'text/html') : null))
      .catch(() => null);
    page.then((doc) => {
      if (!doc) pages.delete(route);
    });
    pages.set(route, page);
  }
  return page;
}

async function openRoute(path: string, { push, origin }: OpenOptions) {
  const route = normalize(path);
  if (push && normalize(location.pathname) !== route) history.pushState({ os: true }, '', route);

  // Bring forward what is already open right away; the fetch below only adds
  // windows of this route that were closed or never opened.
  const existing = allWindows().filter((win) => win.dataset.route === route);
  existing.filter((win) => !isShown(win)).forEach(restoreWindow);
  const existingTarget = existing.find((win) => win.hasAttribute('data-primary')) ?? existing.at(-1);
  if (existingTarget) focusWindow(existingTarget);

  const doc = await fetchPage(route);
  const source = doc?.querySelector('[data-desktop]');
  if (!source) {
    if (!existing.length) window.location.assign(path);
    return;
  }

  const added: HTMLElement[] = [];
  let reopened: HTMLElement | null = null;
  for (const item of Array.from(source.children)) {
    if (!(item instanceof HTMLElement)) continue;
    const isWindow = item.hasAttribute('data-window');
    if (!isWindow && !item.hasAttribute('data-desktop-item')) continue;
    const already = item.id ? document.getElementById(item.id) : null;
    if (already) {
      if (isWindow && !existing.includes(already)) reopened = already;
      continue;
    }
    const node = document.importNode(item, true) as HTMLElement;
    desktop!.append(node);
    if (isWindow) {
      setupWindow(node);
      added.push(node);
    }
  }

  if (!added.length && !existing.length && !reopened) {
    window.location.assign(path);
    return;
  }

  added.forEach((win) => {
    cascadeWindow(win);
    openAnimation(win, origin);
  });

  const candidates = [...existing, ...added];
  const target =
    candidates.find((win) => win.hasAttribute('data-primary')) ?? added.at(-1) ?? existingTarget ?? reopened!;
  if (!isShown(target)) restoreWindow(target);
  focusWindow(target);
  target.focus({ preventScroll: true });
  if (!WIDE.matches && target.dataset.kind !== 'app') {
    target.scrollIntoView({ block: 'start', behavior: animate() ? 'smooth' : 'auto' });
  }
  trackPageView(route);
}

function openAnimation(win: HTMLElement, origin?: Element | null) {
  if (!animate()) return;
  if (WIDE.matches && origin) {
    const from = origin.getBoundingClientRect();
    const to = win.getBoundingClientRect();
    win.style.transformOrigin = `${from.left + from.width / 2 - to.left}px ${from.top + from.height / 2 - to.top}px`;
    win.animate(
      [{ transform: 'scale(0.15)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 260, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    ).finished.then(() => (win.style.transformOrigin = ''));
    return;
  }
  const lift = WIDE.matches ? 'scale(0.96)' : 'translateY(24px)';
  win.animate(
    [{ transform: lift, opacity: 0 }, { transform: 'none', opacity: 1 }],
    { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  );
}

/** Links that should open as windows: same-origin pages, not files or new tabs. */
function windowLink(event: Event): { anchor: HTMLAnchorElement; url: URL } | null {
  const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!anchor || anchor.hasAttribute('download')) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  const href = anchor.getAttribute('href') ?? '';
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null; // files like resume.pdf or rss.xml
  return { anchor, url };
}

function onLinkClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = windowLink(event);
  if (!link) return;
  event.preventDefault();
  openRoute(link.url.pathname, { push: true, origin: link.anchor.closest('.dock-item, .icon') ?? link.anchor });
}

/** Fetch a page as soon as the pointer or keyboard lands on its link. */
function onLinkIntent(event: Event) {
  const link = windowLink(event);
  if (!link) return;
  const route = normalize(link.url.pathname);
  if (allWindows().some((win) => win.dataset.route === route)) return;
  fetchPage(route);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const focused = allWindows().find((win) => win.classList.contains('is-focused') && isShown(win));
  if (focused?.dataset.kind === 'app') closeWindow(focused);
}

function trackPageView(route: string) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', 'page_view', { page_path: route, page_title: document.title });
}

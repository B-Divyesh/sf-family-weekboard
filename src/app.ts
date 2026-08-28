import QRCode from 'qrcode';
import heroDesktop from './assets/weekboard-station-1440.webp';
import heroMobile from './assets/weekboard-station-960.webp';
import { BoardStore } from './db';
import { addDays, dateKey, eventDays, occurrencesInRange, startOfWeek, toLocalInput, type EventOccurrence } from './dates';
import { decryptSnapshot, encryptSnapshot } from './crypto';
import { exportIcs, importIcs } from './ics';
import { CHECKOUT_URL, getCachedUnlock, getLicense, saveLicense, verifyLicense } from './license';
import { DEFAULT_SETTINGS, LANE_COLORS, type BoardEvent, type BoardSettings, type Person } from './models';

const dateLong = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const monthRange = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function download(contents: BlobPart, name: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function inputDate(date: Date): string { return toLocalInput(date).slice(0, 10); }
function inputTime(date: Date): string { return toLocalInput(date).slice(11, 16); }

export class WeekboardApp {
  private events: BoardEvent[] = [];
  private people: Person[] = [];
  private settings: BoardSettings = DEFAULT_SETTINGS;
  private weekStart = startOfWeek(new Date());
  private selectedDay = dateKey(new Date());
  private editingId: string | null = null;
  private returnFocus: HTMLElement | null = null;
  private supporter = false;
  private statusTimer = 0;

  constructor(private readonly root: HTMLElement, private readonly store: BoardStore, private readonly demo = false) {
    this.supporter = !demo && getCachedUnlock();
  }

  async init(): Promise<void> {
    await this.refresh();
    this.applyTheme();
    this.render();
    this.bindGlobalEvents();
    this.captureHandoffFromUrl();
    if (!this.demo) void verifyLicense().then((valid) => {
      if (valid !== this.supporter) { this.supporter = valid; this.render(); }
    });
  }

  private captureHandoffFromUrl(): void {
    if (!location.hash.startsWith('#handoff=')) return;
    try {
      const code = decodeURIComponent(location.hash.slice('#handoff='.length));
      history.replaceState({}, '', `${location.pathname}${location.search}`);
      const field = this.root.querySelector<HTMLTextAreaElement>('#handoffCode');
      const trigger = this.root.querySelector<HTMLElement>('#transferButton');
      if (field && trigger) { field.value = code; this.openDialog('transferDialog', trigger); }
    } catch { this.announce('That QR handoff link could not be read.'); }
  }

  private async refresh(): Promise<void> {
    [this.events, this.people, this.settings] = await Promise.all([
      this.store.getEvents(), this.store.getPeople(), this.store.getSettings()
    ]);
  }

  private applyTheme(): void {
    document.documentElement.dataset.theme = this.settings.theme;
  }

  private render(): void {
    const weekEnd = addDays(this.weekStart, 7);
    const occurrences = occurrencesInRange(this.events, this.weekStart, weekEnd);
    const days = Array.from({ length: 7 }, (_, index) => addDays(this.weekStart, index));
    const peopleMap = new Map(this.people.map((person) => [person.id, person]));
    const today = dateKey(new Date());
    const empty = this.events.length === 0;
    const rangeLabel = `${monthRange.format(this.weekStart)} – ${monthRange.format(addDays(this.weekStart, 6))}`;

    this.root.innerHTML = `
      <header class="topbar">
        <a class="brand" href="/" aria-label="Weekboard home"><span class="brand-mark" aria-hidden="true">W</span><span>WEEKBOARD</span></a>
        <nav class="site-nav" aria-label="Main navigation"><a href="/demo/">Demo</a><a href="#how-it-works">How it works</a><a href="/privacy/">Privacy</a></nav>
        <div class="header-actions">
          <button class="icon-button" id="themeToggle" type="button" aria-label="Change colour theme" title="Change colour theme">◐</button>
          ${this.demo ? '' : `<button class="button secondary compact" id="supportButton" type="button">${this.supporter ? 'Supporter ✓' : 'Support Weekboard'}</button>`}
        </div>
      </header>
      ${this.demo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay separate from your real board.</span><div><button class="button secondary compact" id="resetDemo" type="button">Reset demo</button><button class="button secondary compact" id="startReal" type="button">Start for real</button></div></aside>` : ''}
      <div class="offline-strip" id="networkStatus" role="status" ${navigator.onLine ? 'hidden' : ''}>OFFLINE · changes still save on this device</div>
      <main id="main" tabindex="-1">
        <section class="masthead" aria-labelledby="pageTitle">
          <div>
            <p class="eyebrow">${escapeHtml(this.settings.boardName)} · LOCAL TIME</p>
            <h1 id="pageTitle">Plan your family week together</h1>
            <p class="lede">For families using phones, computers, and paper who need one shared weekly view without a new account.</p>
            <ul class="hero-facts" aria-label="Key facts"><li>Works offline after the first visit.</li><li>Your schedule stays on this device.</li><li>Core planning and export are free.</li></ul>
          </div>
          <div class="primary-actions">
            <button class="button primary" id="addEvent" type="button"><span aria-hidden="true">＋</span> Add plan</button>
            <button class="button secondary" id="transferButton" type="button">Move / share</button>
            ${this.demo ? '' : '<a class="button secondary" href="/demo/">Try it with sample data</a><small>Opens a separate sample board.</small>'}
          </div>
        </section>

        <section class="board-shell" aria-labelledby="weekHeading">
          <div class="week-toolbar">
            <div class="week-nav" aria-label="Choose week">
              <button class="icon-button" id="previousWeek" type="button" aria-label="Previous week">←</button>
              <button class="button text-button" id="todayButton" type="button">This week</button>
              <button class="icon-button" id="nextWeek" type="button" aria-label="Next week">→</button>
            </div>
            <h2 id="weekHeading">${rangeLabel}</h2>
            <div class="board-tools">
              <button class="button text-button" id="peopleButton" type="button">People</button>
              <button class="button text-button" id="printButton" type="button">Print</button>
            </div>
          </div>
          <div class="mobile-days" role="tablist" aria-label="Days this week">
            ${days.map((day) => `<button role="tab" aria-selected="${dateKey(day) === this.selectedDay}" data-day-tab="${dateKey(day)}"><span>${dateLong.format(day).split(',')[0]}</span><strong>${day.getDate()}</strong></button>`).join('')}
          </div>
          <div class="week-grid" role="list" aria-label="Weekly plans">
            ${days.map((day) => this.renderDay(day, occurrences, peopleMap, today)).join('')}
          </div>
          ${empty ? `
            <div class="empty-state">
              <picture>
                <source media="(max-width: 700px)" srcset="${heroMobile}" />
                <img src="${heroDesktop}" width="1440" height="960" alt="Pixel-art household planning console with seven calendar panels" decoding="async" fetchpriority="high" />
              </picture>
              <div>
                <p class="eyebrow">READY PLAYER HOUSEHOLD</p>
                <h2>Your week is clear</h2>
                <p>Add the first plan, or import an existing ICS calendar. Everything stays in this browser unless you explicitly export it.</p>
                <button class="button primary" id="emptyAdd" type="button">Add the first plan</button>
              </div>
            </div>` : ''}
        </section>
        <p class="status-line" id="statusLine" aria-live="polite">Saved locally · ${this.events.length} plan${this.events.length === 1 ? '' : 's'} on board</p>
        <section class="info-section" id="how-it-works" aria-labelledby="howHeading">
          <p class="eyebrow">THREE MOVES</p><h2 id="howHeading">How it works</h2>
          <ol><li><strong>Add plans.</strong> Put each commitment on a person’s lane.</li><li><strong>Check the week.</strong> Use seven columns or one phone-friendly day.</li><li><strong>Move a copy.</strong> Print, export ICS, or share an encrypted snapshot.</li></ol>
        </section>
        <section class="info-section limits" aria-labelledby="limitsHeading">
          <p class="eyebrow">CLEAR BOUNDARIES</p><h2 id="limitsHeading">What Weekboard does not do</h2>
          <p>It does not create accounts, invite people, or sync changes live. File and QR handoffs are snapshots.</p>
        </section>
        ${this.demo ? '' : `<section class="info-section supporter-section" aria-labelledby="supporterHeading">
          <p class="eyebrow">OPTIONAL SUPPORTER PACK</p><h2 id="supporterHeading">Add room for a bigger household</h2>
          <p><strong>₹499 once.</strong> Add more than four people, extra lane colours, and a custom board name. Planning, accessibility, encryption, and export stay free.</p>
          <button class="button secondary" id="supportSectionButton" type="button">See supporter pack</button>
        </section>`}
      </main>
      <footer>
        <span>Plan a family week without a shared cloud account. · Build ${__BUILD_ID__}</span>
        <nav aria-label="Legal and project links"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button class="link-button" id="aboutButton" type="button">About</button><a href="https://sociobot.in">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      </footer>
      <div class="toast" id="updateToast" role="status" hidden><span>A fresh Weekboard is ready.</span><button type="button" id="reloadButton">Reload</button></div>
      ${this.dialogs()}
    `;
    this.bindUi();
  }

  private renderDay(day: Date, occurrences: EventOccurrence[], people: Map<string, Person>, today: string): string {
    const key = dateKey(day);
    const visible = occurrences.filter((occurrence) => eventDays(occurrence).includes(key));
    return `<div class="day-column ${key === today ? 'is-today' : ''} ${key === this.selectedDay ? 'is-selected' : ''}" data-day="${key}" role="listitem" aria-labelledby="day-${key}">
      <button class="day-heading" type="button" data-add-day="${key}">
        <span id="day-${key}">${dateLong.format(day)}</span>${key === today ? '<em>TODAY</em>' : ''}<span aria-hidden="true">＋</span><span class="sr-only">Add a plan</span>
      </button>
      <div class="day-events">
        ${visible.length ? visible.map((event) => this.renderEvent(event, people.get(event.personId), key)).join('') : '<p class="no-plans">Clear</p>'}
      </div>
    </div>`;
  }

  private renderEvent(event: EventOccurrence, person: Person | undefined, day: string): string {
    const isFirstDay = dateKey(event.occurrenceStart) === day;
    const laneName = person?.name ?? 'Unassigned';
    const time = event.allDay ? 'All day' : `${isFirstDay ? timeFormat.format(event.occurrenceStart) : '↳'}${eventDays(event).length === 1 ? `–${timeFormat.format(event.occurrenceEnd)}` : ''}`;
    return `<button class="event-card" type="button" data-edit-event="${event.sourceId}" style="--lane:${person?.color ?? LANE_COLORS[0]}" aria-label="Edit ${escapeHtml(event.title)}, ${time}, ${escapeHtml(laneName)}">
      <span class="event-time">${time}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <span class="event-person"><i aria-hidden="true">${escapeHtml(laneName.slice(0, 1).toUpperCase())}</i>${escapeHtml(laneName)}</span>
      ${event.location ? `<span class="event-location">⌖ ${escapeHtml(event.location)}</span>` : ''}
      ${event.recurrence !== 'none' ? '<span class="repeat-mark" title="Repeating plan" aria-label="Repeating plan">↻</span>' : ''}
    </button>`;
  }

  private dialogs(): string {
    return `
      <dialog id="eventDialog" aria-labelledby="eventDialogTitle"><form method="dialog" id="eventForm" class="dialog-form">
        <div class="dialog-header"><div><p class="eyebrow">PLAN SLOT</p><h2 id="eventDialogTitle">Add a plan</h2></div><button class="icon-button close-dialog" value="cancel" aria-label="Close plan editor">×</button></div>
        <div class="form-grid">
          <label class="full">What’s happening?<input id="eventTitle" name="title" maxlength="100" required autocomplete="off" /></label>
          <label>Who?<select id="eventPerson" name="personId" required>${this.people.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`).join('')}</select></label>
          <label class="check-label"><input id="eventAllDay" name="allDay" type="checkbox" /> All day</label>
          <label>Starts<input id="eventStartDate" name="startDate" type="date" required /></label>
          <label>Start time<input id="eventStartTime" name="startTime" type="time" required /></label>
          <label>Ends<input id="eventEndDate" name="endDate" type="date" required /></label>
          <label>End time<input id="eventEndTime" name="endTime" type="time" required /></label>
          <label>Repeats<select id="eventRepeat" name="recurrence"><option value="none">Does not repeat</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></label>
          <label>Repeat until <span class="hint">optional</span><input id="eventRepeatUntil" name="recurrenceUntil" type="date" /></label>
          <label class="full">Place <span class="hint">optional</span><input id="eventLocation" name="location" maxlength="100" autocomplete="off" /></label>
          <label class="full">Note <span class="hint">optional</span><textarea id="eventNotes" name="notes" rows="2" maxlength="500"></textarea></label>
        </div>
        <p class="form-error" id="eventError" role="alert"></p>
        <div class="dialog-actions"><button class="button danger" id="deleteEvent" type="button" hidden>Delete</button><span></span><button class="button secondary close-dialog" value="cancel">Cancel</button><button class="button primary" value="default" id="saveEvent">Save plan</button></div>
      </form></dialog>

      <dialog id="peopleDialog" aria-labelledby="peopleTitle"><div class="dialog-form">
        <div class="dialog-header"><div><p class="eyebrow">LANES</p><h2 id="peopleTitle">People on this board</h2></div><button class="icon-button close-dialog" aria-label="Close people settings">×</button></div>
        <p class="dialog-intro">Colour helps you scan; every plan also carries the person’s name.</p>
        <ul class="people-list">${this.people.map((person, index) => `<li><span class="person-chip" style="--lane:${person.color}"><i>${escapeHtml(person.name.slice(0, 1).toUpperCase())}</i>${escapeHtml(person.name)}</span>${this.people.length > 1 ? `<button class="icon-button" type="button" data-delete-person="${person.id}" aria-label="Remove ${escapeHtml(person.name)} and their plans">×</button>` : ''}${index === 0 ? '<small>default</small>' : ''}</li>`).join('')}</ul>
        <form id="personForm" class="inline-form"><label>Name<input name="personName" required maxlength="30" autocomplete="off" /></label><label>Colour<select name="personColor">${LANE_COLORS.map((color, index) => `<option value="${color}" ${!this.supporter && index > 3 ? 'disabled' : ''}>Colour ${index + 1}${!this.supporter && index > 3 ? ' · supporter' : ''}</option>`).join('')}</select></label><button class="button primary" type="submit">Add person</button></form>
        <p class="form-error" id="peopleError" role="alert"></p>
        <div class="settings-row"><label for="boardName">Board name ${this.supporter ? '' : '<span class="hint">supporter extra</span>'}</label><div><input id="boardName" maxlength="40" value="${escapeHtml(this.settings.boardName)}" ${this.supporter ? '' : 'disabled'} /><button class="button secondary" id="saveBoardName" type="button" ${this.supporter ? '' : 'disabled'}>Save name</button></div></div>
        <button class="button secondary close-dialog" type="button">Done</button>
      </div></dialog>

      <dialog id="transferDialog" aria-labelledby="transferTitle"><div class="dialog-form transfer-dialog">
        <div class="dialog-header"><div><p class="eyebrow">EXPLICIT HANDOFF</p><h2 id="transferTitle">Move or share a copy</h2></div><button class="icon-button close-dialog" aria-label="Close move and share">×</button></div>
        <div class="notice"><strong>This is not live sync.</strong> Importing replaces the receiving board with the copy you send. Weekboard never uploads it.</div>
        <section><h3>Standard calendar file</h3><p>Use ICS with Apple, Google, Outlook, or another calendar app. Person colours are included as notes.</p><div class="action-row"><button class="button primary" id="exportIcs" type="button">Export ICS</button><label class="button secondary file-button">Import ICS<input id="importIcs" type="file" accept=".ics,text/calendar" /></label></div></section>
        <section><h3>Private Weekboard copy</h3><p>Encrypts people, notes, and plans in this browser. Share the passphrase separately.</p><label>Passphrase <span class="hint">at least 8 characters</span><input id="handoffPassphrase" type="password" minlength="8" autocomplete="new-password" /></label><div class="action-row"><button class="button primary" id="exportEncrypted" type="button">Download encrypted copy</button><button class="button secondary" id="makeQr" type="button">Make QR handoff</button><label class="button secondary file-button">Open encrypted copy<input id="importEncrypted" type="file" accept=".weekboard,text/plain" /></label></div>
          <div id="qrOutput" class="qr-output" hidden></div>
          <label>Or paste a handoff code<textarea id="handoffCode" rows="3" spellcheck="false"></textarea></label><button class="button secondary" id="importCode" type="button">Open pasted copy</button>
        </section>
        <p class="form-error" id="transferError" role="alert"></p>
      </div></dialog>

      <dialog id="supportDialog" aria-labelledby="supportTitle"><div class="dialog-form">
        <div class="dialog-header"><div><p class="eyebrow">ONE-TIME SUPPORTER PACK</p><h2 id="supportTitle">Keep small software possible</h2></div><button class="icon-button close-dialog" aria-label="Close supporter information">×</button></div>
        ${this.supporter ? '<div class="supporter-active"><strong>Supporter pack active</strong><span>Thanks for backing private household software.</span></div>' : '<p class="price">₹499 <small>one time</small></p><p>Core planning, offline use, printing, encryption, and every export stay free. The supporter pack adds a custom board name, extra lane colours, and more than four people.</p>'}
        <ul class="feature-list"><li>No subscription</li><li>No account required</li><li>One license can be restored on your devices</li></ul>
        ${this.supporter ? '' : `<a class="button primary center" href="${CHECKOUT_URL}">Buy supporter pack</a>`}
        <form id="licenseForm"><label>Have a license? Paste it here<input name="license" value="${escapeHtml(this.demo ? '' : getLicense())}" autocomplete="off" /></label><button class="button secondary" type="submit">Verify license</button></form>
        <p class="form-error" id="licenseStatus" role="status"></p><p class="fine-print">Sociobot / Dodo is the merchant of record. Refunds are handled there and revoke the license. See <a href="/privacy/">privacy</a> and <a href="/terms/">terms</a>.</p>
      </div></dialog>

      <dialog id="aboutDialog" aria-labelledby="aboutTitle"><div class="dialog-form"><div class="dialog-header"><div><p class="eyebrow">ABOUT</p><h2 id="aboutTitle">A calendar that is not a cloud</h2></div><button class="icon-button close-dialog" aria-label="Close about Weekboard">×</button></div><p>Weekboard is a deliberately small, installable weekly view. It stores data in IndexedDB on this device and sends nothing unless you choose an export.</p><p>The first-run pixel illustration is original AI-generated artwork made for Weekboard with the factory image model; interface marks are hand-authored.</p><button class="button secondary close-dialog" type="button">Close</button></div></dialog>
    `;
  }

  private bindUi(): void {
    this.on('#addEvent', 'click', (event) => this.openEvent(undefined, undefined, event.currentTarget as HTMLElement));
    this.on('#emptyAdd', 'click', (event) => this.openEvent(undefined, undefined, event.currentTarget as HTMLElement));
    this.root.querySelectorAll<HTMLElement>('[data-add-day]').forEach((button) => button.addEventListener('click', () => this.openEvent(button.dataset.addDay, undefined, button)));
    this.root.querySelectorAll<HTMLElement>('[data-edit-event]').forEach((button) => button.addEventListener('click', () => this.openEvent(undefined, button.dataset.editEvent, button)));
    this.root.querySelectorAll<HTMLElement>('[data-day-tab]').forEach((button) => {
      button.tabIndex = button.dataset.dayTab === this.selectedDay ? 0 : -1;
      button.addEventListener('click', () => { this.selectedDay = button.dataset.dayTab ?? this.selectedDay; this.render(); });
      button.addEventListener('keydown', (event) => this.moveDayTab(event));
    });
    this.on('#previousWeek', 'click', () => { this.weekStart = addDays(this.weekStart, -7); this.selectedDay = dateKey(this.weekStart); this.render(); });
    this.on('#nextWeek', 'click', () => { this.weekStart = addDays(this.weekStart, 7); this.selectedDay = dateKey(this.weekStart); this.render(); });
    this.on('#todayButton', 'click', () => { this.weekStart = startOfWeek(new Date()); this.selectedDay = dateKey(new Date()); this.render(); });
    this.on('#printButton', 'click', () => window.print());
    this.on('#peopleButton', 'click', (event) => this.openDialog('peopleDialog', event.currentTarget as HTMLElement));
    this.on('#transferButton', 'click', (event) => this.openDialog('transferDialog', event.currentTarget as HTMLElement));
    this.on('#supportButton', 'click', (event) => this.openDialog('supportDialog', event.currentTarget as HTMLElement));
    this.on('#supportSectionButton', 'click', (event) => this.openDialog('supportDialog', event.currentTarget as HTMLElement));
    this.on('#aboutButton', 'click', (event) => this.openDialog('aboutDialog', event.currentTarget as HTMLElement));
    this.on('#themeToggle', 'click', () => void this.cycleTheme());
    this.root.querySelectorAll<HTMLButtonElement>('.close-dialog').forEach((button) => button.addEventListener('click', () => this.closeDialog(button.closest('dialog')!)));
    this.root.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('cancel', () => { setTimeout(() => this.returnFocus?.focus()); }));
    this.on('#eventAllDay', 'change', () => this.toggleTimeInputs());
    this.on('#eventForm', 'submit', (event) => void this.saveEvent(event as SubmitEvent));
    this.on('#deleteEvent', 'click', () => void this.deleteCurrentEvent());
    this.on('#personForm', 'submit', (event) => void this.addPerson(event));
    this.root.querySelectorAll<HTMLElement>('[data-delete-person]').forEach((button) => button.addEventListener('click', () => void this.deletePerson(button.dataset.deletePerson!)));
    this.on('#saveBoardName', 'click', () => void this.saveBoardName());
    this.on('#exportIcs', 'click', () => this.exportIcs());
    this.on('#importIcs', 'change', (event) => void this.importIcsFile(event));
    this.on('#exportEncrypted', 'click', () => void this.exportEncrypted());
    this.on('#makeQr', 'click', () => void this.makeQr());
    this.on('#importEncrypted', 'change', (event) => void this.importEncryptedFile(event));
    this.on('#importCode', 'click', () => void this.importEncryptedCode());
    this.on('#licenseForm', 'submit', (event) => void this.restoreLicense(event));
    this.on('#resetDemo', 'click', () => void this.resetDemo());
    this.on('#startReal', 'click', () => void this.startForReal());
  }

  private moveDayTab(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const tabs = [...this.root.querySelectorAll<HTMLButtonElement>('[data-day-tab]')];
    const current = tabs.indexOf(event.currentTarget as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    this.selectedDay = tabs[next].dataset.dayTab ?? this.selectedDay;
    this.render();
    this.root.querySelector<HTMLButtonElement>(`[data-day-tab="${this.selectedDay}"]`)?.focus();
  }

  private async resetDemo(): Promise<void> {
    if (!this.demo) return;
    await this.store.resetDemo();
    await this.refresh();
    this.render();
    this.announce('Demo reset to the original sample plans.');
  }

  private async startForReal(): Promise<void> {
    if (this.demo) await this.store.resetDemo();
    location.assign('/');
  }

  private bindGlobalEvents(): void {
    window.addEventListener('online', () => this.updateNetwork(true));
    window.addEventListener('offline', () => this.updateNetwork(false));
    navigator.serviceWorker?.addEventListener('message', (event) => { if (event.data?.type === 'UPDATE_READY') this.showUpdate(); });
  }

  private on(selector: string, event: string, handler: EventListener): void {
    this.root.querySelector(selector)?.addEventListener(event, handler);
  }

  private openDialog(id: string, origin: HTMLElement): void {
    this.returnFocus = origin;
    const dialog = this.root.querySelector<HTMLDialogElement>(`#${id}`)!;
    dialog.showModal();
    setTimeout(() => dialog.querySelector<HTMLElement>('input, button, select, textarea, a')?.focus());
  }

  private closeDialog(dialog: HTMLDialogElement): void {
    dialog.close();
    this.returnFocus?.focus();
  }

  private openEvent(day?: string, id?: string, origin?: HTMLElement): void {
    this.editingId = id ?? null;
    const event = id ? this.events.find((item) => item.id === id) : undefined;
    const start = event ? new Date(event.start) : new Date(`${day ?? this.selectedDay}T09:00:00`);
    let end = event ? new Date(event.end) : new Date(start.getTime() + 3_600_000);
    // All-day end values are exclusive civil midnights. Calendar arithmetic,
    // rather than milliseconds, keeps the editor correct on 23/25-hour days.
    if (event?.allDay) end = addDays(end, -1);
    const dialog = this.root.querySelector<HTMLDialogElement>('#eventDialog')!;
    dialog.querySelector<HTMLElement>('#eventDialogTitle')!.textContent = event ? 'Edit plan' : 'Add a plan';
    (dialog.querySelector('#eventTitle') as HTMLInputElement).value = event?.title ?? '';
    (dialog.querySelector('#eventPerson') as HTMLSelectElement).value = event?.personId ?? this.people[0]?.id;
    (dialog.querySelector('#eventAllDay') as HTMLInputElement).checked = event?.allDay ?? false;
    (dialog.querySelector('#eventStartDate') as HTMLInputElement).value = inputDate(start);
    (dialog.querySelector('#eventStartTime') as HTMLInputElement).value = inputTime(start);
    (dialog.querySelector('#eventEndDate') as HTMLInputElement).value = inputDate(end);
    (dialog.querySelector('#eventEndTime') as HTMLInputElement).value = inputTime(end);
    (dialog.querySelector('#eventRepeat') as HTMLSelectElement).value = event?.recurrence ?? 'none';
    (dialog.querySelector('#eventRepeatUntil') as HTMLInputElement).value = event?.recurrenceUntil?.slice(0, 10) ?? '';
    (dialog.querySelector('#eventLocation') as HTMLInputElement).value = event?.location ?? '';
    (dialog.querySelector('#eventNotes') as HTMLTextAreaElement).value = event?.notes ?? '';
    (dialog.querySelector('#deleteEvent') as HTMLButtonElement).hidden = !event;
    (dialog.querySelector('#eventError') as HTMLElement).textContent = '';
    this.toggleTimeInputs();
    this.openDialog('eventDialog', origin ?? document.activeElement as HTMLElement);
  }

  private toggleTimeInputs(): void {
    const allDay = (this.root.querySelector('#eventAllDay') as HTMLInputElement).checked;
    ['#eventStartTime', '#eventEndTime'].forEach((selector) => {
      const input = this.root.querySelector(selector) as HTMLInputElement;
      input.disabled = allDay; input.required = !allDay;
    });
  }

  private async saveEvent(submit: SubmitEvent): Promise<void> {
    submit.preventDefault();
    if (submit.submitter && (submit.submitter as HTMLButtonElement).value === 'cancel') return;
    const form = submit.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const allDay = data.get('allDay') === 'on';
    const startDate = String(data.get('startDate'));
    const endDate = String(data.get('endDate'));
    const recurrence = String(data.get('recurrence')) as BoardEvent['recurrence'];
    const recurrenceUntilDate = String(data.get('recurrenceUntil') || '') || undefined;
    const title = String(data.get('title')).trim();
    const start = new Date(`${startDate}T${allDay ? '00:00' : data.get('startTime')}:00`);
    let end = new Date(`${endDate}T${allDay ? '00:00' : data.get('endTime')}:00`);
    if (allDay) end = addDays(end, 1);
    const error = this.root.querySelector<HTMLElement>('#eventError')!;
    if (!title) { error.textContent = 'Give this plan a name, not only spaces.'; return; }
    if (end <= start) { error.textContent = 'The end must be after the start.'; return; }
    if (recurrence !== 'none' && recurrenceUntilDate && recurrenceUntilDate < startDate) {
      error.textContent = 'Repeat until must be the start date or a later date.';
      return;
    }
    const existing = this.events.find((item) => item.id === this.editingId);
    // Preserve a timed ICS UNTIL when its date was not changed in the editor.
    // A date input cannot display the original time component.
    const recurrenceUntil = recurrenceUntilDate && existing?.recurrenceUntil?.includes('T') && existing.recurrenceUntil.slice(0, 10) === recurrenceUntilDate
      ? existing.recurrenceUntil
      : recurrenceUntilDate;
    const event: BoardEvent = {
      id: existing?.id ?? crypto.randomUUID(), title, personId: String(data.get('personId')),
      start: start.toISOString(), end: end.toISOString(), allDay,
      location: String(data.get('location')).trim(), notes: String(data.get('notes')).trim(),
      recurrence, recurrenceUntil,
      updatedAt: new Date().toISOString()
    };
    try {
      await this.store.saveEvent(event); await this.refresh(); this.closeDialog(form.closest('dialog')!); this.render(); this.announce(existing ? 'Plan updated.' : 'Plan added.');
    } catch { error.textContent = 'That plan could not be saved. Your existing board is unchanged.'; }
  }

  private async deleteCurrentEvent(): Promise<void> {
    const event = this.events.find((item) => item.id === this.editingId);
    if (!event || !confirm(`Delete “${event.title}”${event.recurrence !== 'none' ? ' and all its repeats' : ''}?`)) return;
    await this.store.deleteEvent(event.id); await this.refresh(); this.closeDialog(this.root.querySelector('#eventDialog')!); this.render(); this.announce('Plan deleted.');
  }

  private async addPerson(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form); const error = this.root.querySelector<HTMLElement>('#peopleError')!;
    if (!this.supporter && this.people.length >= 4) { error.textContent = 'The free board includes four people. The supporter pack removes that limit.'; return; }
    const name = String(data.get('personName')).trim();
    if (!name) { error.textContent = 'Give this person a name, not only spaces.'; return; }
    await this.store.savePerson({ id: crypto.randomUUID(), name, color: String(data.get('personColor')), createdAt: new Date().toISOString() });
    await this.refresh(); this.render(); this.announce(`${name} added.`);
  }

  private async deletePerson(id: string): Promise<void> {
    const person = this.people.find((item) => item.id === id);
    const count = this.events.filter((event) => event.personId === id).length;
    if (!person || !confirm(`Remove ${person.name}${count ? ` and ${count} of their plan${count === 1 ? '' : 's'}` : ''}?`)) return;
    await this.store.deletePerson(id); await this.refresh(); this.render(); this.announce(`${person.name} removed.`);
  }

  private async saveBoardName(): Promise<void> {
    if (!this.supporter) return;
    const input = this.root.querySelector<HTMLInputElement>('#boardName')!;
    this.settings = { ...this.settings, boardName: input.value.trim() || DEFAULT_SETTINGS.boardName };
    await this.store.saveSettings(this.settings); this.render(); this.announce('Board name saved.');
  }

  private async cycleTheme(): Promise<void> {
    const next = this.settings.theme === 'system' ? 'light' : this.settings.theme === 'light' ? 'dark' : 'system';
    this.settings = { ...this.settings, theme: next }; await this.store.saveSettings(this.settings); this.applyTheme(); this.render(); this.announce(`Theme: ${next}.`);
  }

  private exportIcs(): void {
    download(exportIcs(this.events, this.people, this.settings.boardName), `weekboard-${dateKey(new Date())}.ics`, 'text/calendar;charset=utf-8');
    this.announce('ICS calendar exported.');
  }

  private async importIcsFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    const error = this.root.querySelector<HTMLElement>('#transferError')!;
    try {
      const imported = importIcs(await file.text(), this.people[0].id);
      for (const item of imported) await this.store.saveEvent(item);
      await this.refresh(); this.closeDialog(this.root.querySelector('#transferDialog')!); this.render(); this.announce(`${imported.length} plan${imported.length === 1 ? '' : 's'} imported from ICS.`);
    } catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The ICS file could not be read.'; }
  }

  private passphrase(): string { return this.root.querySelector<HTMLInputElement>('#handoffPassphrase')!.value; }

  private async encryptedCode(): Promise<string> { return encryptSnapshot(await this.store.snapshot(), this.passphrase()); }

  private async exportEncrypted(): Promise<void> {
    const error = this.root.querySelector<HTMLElement>('#transferError')!;
    try { download(await this.encryptedCode(), `weekboard-private-${dateKey(new Date())}.weekboard`, 'text/plain;charset=utf-8'); error.textContent = ''; this.announce('Encrypted Weekboard copy downloaded.'); }
    catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The encrypted copy could not be created.'; }
  }

  private async makeQr(): Promise<void> {
    const error = this.root.querySelector<HTMLElement>('#transferError')!;
    const output = this.root.querySelector<HTMLElement>('#qrOutput')!;
    try {
      const code = await this.encryptedCode();
      const handoffUrl = `${location.origin}/#handoff=${encodeURIComponent(code)}`;
      if (handoffUrl.length > 2800) throw new Error('This board is too large for one QR. Download the encrypted copy instead.');
      const src = await QRCode.toDataURL(handoffUrl, { errorCorrectionLevel: 'L', width: 320, margin: 2, color: { dark: '#18242e', light: '#fffdf3' } });
      output.innerHTML = `<img src="${src}" width="320" height="320" alt="Encrypted Weekboard handoff QR code" /><p>Scan on the other device, then enter the passphrase separately.</p><button class="button secondary" id="copyCode" type="button">Copy code instead</button>`;
      output.hidden = false; (this.root.querySelector('#handoffCode') as HTMLTextAreaElement).value = code;
      this.on('#copyCode', 'click', () => void navigator.clipboard.writeText(code).then(() => this.announce('Encrypted code copied.')).catch(() => { error.textContent = 'Copy was blocked. Select the code below and copy it manually.'; }));
      error.textContent = '';
    } catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The QR handoff could not be created.'; }
  }

  private async importEncryptedFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    (this.root.querySelector('#handoffCode') as HTMLTextAreaElement).value = await file.text();
    await this.importEncryptedCode();
  }

  private async importEncryptedCode(): Promise<void> {
    const code = this.root.querySelector<HTMLTextAreaElement>('#handoffCode')!.value;
    const error = this.root.querySelector<HTMLElement>('#transferError')!;
    if (!code.trim()) { error.textContent = 'Choose an encrypted copy or paste its handoff code first.'; return; }
    try {
      const snapshot = await decryptSnapshot(code, this.passphrase());
      if (!confirm(`Replace this board with “${snapshot.settings?.boardName ?? 'Our week'}” (${snapshot.events.length} plans)?`)) return;
      await this.store.replace(snapshot); await this.refresh(); this.applyTheme(); this.closeDialog(this.root.querySelector('#transferDialog')!); this.render(); this.announce('Encrypted Weekboard copy opened.');
    } catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The encrypted copy could not be opened.'; }
  }

  private async restoreLicense(event: Event): Promise<void> {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement;
    const token = String(new FormData(form).get('license')).trim(); const status = this.root.querySelector<HTMLElement>('#licenseStatus')!;
    if (!token) { status.textContent = 'Paste the license token from your receipt.'; return; }
    saveLicense(token); status.textContent = 'Checking license…';
    const valid = await verifyLicense(true); this.supporter = valid;
    status.textContent = valid ? 'License active. Supporter extras are unlocked.' : 'That license is not active. Check the token or use the buy link.';
    if (valid) setTimeout(() => { this.closeDialog(this.root.querySelector('#supportDialog')!); this.render(); this.announce('Supporter pack unlocked.'); }, 600);
  }

  private announce(message: string): void {
    clearTimeout(this.statusTimer);
    const line = this.root.querySelector<HTMLElement>('#statusLine'); if (line) line.textContent = message;
    this.statusTimer = window.setTimeout(() => { const current = this.root.querySelector<HTMLElement>('#statusLine'); if (current) current.textContent = `Saved locally · ${this.events.length} plan${this.events.length === 1 ? '' : 's'} on board`; }, 4000);
  }

  private updateNetwork(online: boolean): void {
    const strip = this.root.querySelector<HTMLElement>('#networkStatus'); if (!strip) return;
    strip.hidden = online; this.announce(online ? 'Back online. Your board remained on this device.' : 'Offline. Changes still save on this device.');
  }

  private showUpdate(): void {
    const toast = this.root.querySelector<HTMLElement>('#updateToast'); if (!toast) return;
    toast.hidden = false; this.on('#reloadButton', 'click', () => location.reload());
  }
}

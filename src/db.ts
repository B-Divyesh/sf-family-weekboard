import type { BoardEvent, BoardSettings, BoardSnapshot, Person } from './models';
import { DEFAULT_SETTINGS, LANE_COLORS } from './models';

const DB_NAME = 'weekboard-local-v1';
const DEMO_DB_NAME = 'demo:weekboard-local-v1';
const DB_VERSION = 2;

function localDateKey(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// A v1 board could contain a recurrence ending before it began. Keep its
// initial plan visible (and therefore editable) instead of leaving a hidden
// record stranded in IndexedDB.
function recoverRecurrenceRange(event: BoardEvent): BoardEvent {
  if (event.recurrence !== 'none' && event.recurrenceUntil && event.recurrenceUntil < localDateKey(event.start)) {
    return { ...event, recurrenceUntil: localDateKey(event.start) };
  }
  return event;
}

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error ?? new Error('The local database could not be opened.'));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('The local change could not be saved.'));
    tx.onabort = () => reject(tx.error ?? new Error('The local change was cancelled.'));
  });
}

export async function openBoardDb(demo = false): Promise<IDBDatabase> {
  const open = indexedDB.open(demo ? DEMO_DB_NAME : DB_NAME, DB_VERSION);
  open.onupgradeneeded = (upgrade) => {
    const db = open.result;
    if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('people')) db.createObjectStore('people', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    if (open.transaction && (upgrade as IDBVersionChangeEvent).oldVersion < 2) {
      const events = open.transaction.objectStore('events');
      events.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (!cursor) return;
        const recovered = recoverRecurrenceRange(cursor.value as BoardEvent);
        if (recovered !== cursor.value) cursor.update(recovered);
        cursor.continue();
      };
    }
  };
  return request(open);
}

export class BoardStore {
  constructor(private readonly db: IDBDatabase) {}

  static async create(demo = false): Promise<BoardStore> {
    const store = new BoardStore(await openBoardDb(demo));
    const people = await store.getPeople();
    if (!people.length) {
      if (demo) await store.resetDemo();
      else await store.savePerson({ id: crypto.randomUUID(), name: 'Everyone', color: LANE_COLORS[0], createdAt: new Date().toISOString() });
    }
    return store;
  }

  async getEvents(): Promise<BoardEvent[]> {
    return request(this.db.transaction('events').objectStore('events').getAll());
  }

  async getPeople(): Promise<Person[]> {
    const people: Person[] = await request(this.db.transaction('people').objectStore('people').getAll());
    return people.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getSettings(): Promise<BoardSettings> {
    return (await request(this.db.transaction('meta').objectStore('meta').get('settings'))) ?? DEFAULT_SETTINGS;
  }

  async saveEvent(event: BoardEvent): Promise<void> {
    const tx = this.db.transaction('events', 'readwrite');
    tx.objectStore('events').put(recoverRecurrenceRange(event));
    await transactionDone(tx);
  }

  async deleteEvent(id: string): Promise<void> {
    const tx = this.db.transaction('events', 'readwrite');
    tx.objectStore('events').delete(id);
    await transactionDone(tx);
  }

  async savePerson(person: Person): Promise<void> {
    const tx = this.db.transaction('people', 'readwrite');
    tx.objectStore('people').put(person);
    await transactionDone(tx);
  }

  async deletePerson(id: string): Promise<void> {
    const tx = this.db.transaction(['people', 'events'], 'readwrite');
    tx.objectStore('people').delete(id);
    const events = await request(tx.objectStore('events').getAll()) as BoardEvent[];
    events.filter((event) => event.personId === id).forEach((event) => tx.objectStore('events').delete(event.id));
    await transactionDone(tx);
  }

  async saveSettings(settings: BoardSettings): Promise<void> {
    const tx = this.db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(settings, 'settings');
    await transactionDone(tx);
  }

  async snapshot(): Promise<BoardSnapshot> {
    const [people, events, settings] = await Promise.all([this.getPeople(), this.getEvents(), this.getSettings()]);
    return { format: 'weekboard', version: 1, exportedAt: new Date().toISOString(), people, events, settings };
  }

  async replace(snapshot: BoardSnapshot): Promise<void> {
    if (snapshot.format !== 'weekboard' || snapshot.version !== 1 || !Array.isArray(snapshot.people) || !snapshot.people.length || !Array.isArray(snapshot.events)) {
      throw new Error('This is not a valid Weekboard v1 file.');
    }
    const tx = this.db.transaction(['people', 'events', 'meta'], 'readwrite');
    tx.objectStore('people').clear();
    tx.objectStore('events').clear();
    snapshot.people.forEach((person) => tx.objectStore('people').put(person));
    snapshot.events.forEach((event) => tx.objectStore('events').put(recoverRecurrenceRange(event)));
    tx.objectStore('meta').put(snapshot.settings ?? DEFAULT_SETTINGS, 'settings');
    await transactionDone(tx);
  }

  async resetDemo(now = new Date()): Promise<void> {
    const monday = new Date(now);
    const weekday = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - weekday);
    monday.setHours(0, 0, 0, 0);
    const at = (day: number, hour: number, minute = 0) => {
      const value = new Date(monday);
      value.setDate(value.getDate() + day);
      value.setHours(hour, minute, 0, 0);
      return value.toISOString();
    };
    const createdAt = now.toISOString();
    const people: Person[] = [
      { id: 'demo-asha', name: 'Asha', color: LANE_COLORS[0], createdAt },
      { id: 'demo-ravi', name: 'Ravi', color: LANE_COLORS[1], createdAt },
      { id: 'demo-kids', name: 'Kids', color: LANE_COLORS[2], createdAt }
    ];
    const events: BoardEvent[] = [
      { id: 'demo-school', title: 'School drop-off', personId: 'demo-kids', start: at(0, 8), end: at(0, 8, 30), allDay: false, location: 'North gate', notes: '', recurrence: 'daily', recurrenceUntil: localDateKey(at(4, 8)), updatedAt: createdAt },
      { id: 'demo-dentist', title: 'Dentist', personId: 'demo-asha', start: at(2, 15, 30), end: at(2, 16, 30), allDay: false, location: 'Oak Street', notes: '', recurrence: 'none', updatedAt: createdAt },
      { id: 'demo-football', title: 'Football practice', personId: 'demo-kids', start: at(4, 17), end: at(4, 18, 15), allDay: false, location: 'Community field', notes: '', recurrence: 'weekly', updatedAt: createdAt },
      { id: 'demo-groceries', title: 'Groceries and meal prep', personId: 'demo-ravi', start: at(6, 10), end: at(6, 12), allDay: false, location: 'Market', notes: '', recurrence: 'none', updatedAt: createdAt }
    ];
    await this.replace({
      format: 'weekboard', version: 1, exportedAt: createdAt,
      people, events, settings: { ...DEFAULT_SETTINGS, boardName: 'Patel family week' }
    });
  }
}

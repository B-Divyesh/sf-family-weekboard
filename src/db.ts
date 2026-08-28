import type { BoardEvent, BoardSettings, BoardSnapshot, Person } from './models';
import { DEFAULT_SETTINGS, LANE_COLORS } from './models';

const DB_NAME = 'weekboard-local-v1';
const DB_VERSION = 1;

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

export async function openBoardDb(): Promise<IDBDatabase> {
  const open = indexedDB.open(DB_NAME, DB_VERSION);
  open.onupgradeneeded = () => {
    const db = open.result;
    if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('people')) db.createObjectStore('people', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
  };
  return request(open);
}

export class BoardStore {
  constructor(private readonly db: IDBDatabase) {}

  static async create(): Promise<BoardStore> {
    const store = new BoardStore(await openBoardDb());
    const people = await store.getPeople();
    if (!people.length) {
      await store.savePerson({ id: crypto.randomUUID(), name: 'Everyone', color: LANE_COLORS[0], createdAt: new Date().toISOString() });
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
    tx.objectStore('events').put(event);
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
    snapshot.events.forEach((event) => tx.objectStore('events').put(event));
    tx.objectStore('meta').put(snapshot.settings ?? DEFAULT_SETTINGS, 'settings');
    await transactionDone(tx);
  }
}

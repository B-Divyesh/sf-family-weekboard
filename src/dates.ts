import type { BoardEvent } from './models';

export const DAY_MS = 86_400_000;

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

export function addDays(date: Date, count: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toLocalInput(value: Date): string {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function nextOccurrence(date: Date, recurrence: BoardEvent['recurrence'], anchorDay: number): Date {
  const next = new Date(date);
  if (recurrence === 'daily') next.setDate(next.getDate() + 1);
  if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
  if (recurrence === 'monthly') {
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(anchorDay, last));
  }
  return next;
}

export interface EventOccurrence extends BoardEvent {
  occurrenceStart: Date;
  occurrenceEnd: Date;
  sourceId: string;
}

export function occurrencesInRange(events: BoardEvent[], from: Date, until: Date): EventOccurrence[] {
  const output: EventOccurrence[] = [];
  for (const event of events) {
    let start = new Date(event.start);
    const anchorDay = start.getDate();
    const duration = Math.max(0, new Date(event.end).getTime() - start.getTime());
    const recurrenceLimit = event.recurrenceUntil ? new Date(`${event.recurrenceUntil}T23:59:59`) : null;
    let guard = 0;
    while (start < until && guard++ < 50_000) {
      const end = new Date(start.getTime() + duration);
      if (end > from && start < until && (!recurrenceLimit || start <= recurrenceLimit)) {
        output.push({ ...event, sourceId: event.id, occurrenceStart: new Date(start), occurrenceEnd: end });
      }
      if (event.recurrence === 'none' || (recurrenceLimit && start >= recurrenceLimit)) break;
      start = nextOccurrence(start, event.recurrence, anchorDay);
    }
  }
  return output.sort((a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime());
}

export function eventDays(occurrence: EventOccurrence): string[] {
  const days: string[] = [];
  let cursor = new Date(occurrence.occurrenceStart);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(occurrence.occurrenceEnd);
  if (occurrence.allDay && last.getHours() === 0 && last.getMinutes() === 0) last.setMilliseconds(-1);
  while (cursor <= last && days.length < 32) {
    days.push(dateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

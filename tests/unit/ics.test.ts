import { describe, expect, it } from 'vitest';
import { exportIcs, importIcs } from '../../src/ics';
import type { BoardEvent, Person } from '../../src/models';

const person: Person = { id: 'person-1', name: 'Mum, Dad & kids', color: '#087d96', createdAt: '2026-08-20T00:00:00.000Z' };
const event: BoardEvent = {
  id: 'school-run', title: 'School run, then library', personId: person.id,
  start: '2026-08-24T07:30:00.000Z', end: '2026-08-24T08:45:00.000Z', allDay: false,
  location: 'North; gate', notes: 'Bring books\nand card', recurrence: 'weekly', recurrenceUntil: '2026-12-14',
  updatedAt: '2026-08-20T10:00:00.000Z'
};

describe('ICS interoperability', () => {
  it('exports valid UTC dates, escaped text, lane metadata, and RRULE', () => {
    const ics = exportIcs([event], [person], 'Our week');
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART:20260824T073000Z');
    expect(ics).toContain('SUMMARY:School run\\, then library');
    expect(ics).toContain('LOCATION:North\\; gate');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;UNTIL=20261214T235959Z');
    expect(ics).toContain('Weekboard lane: Mum\\, Dad & kids');
  });

  it('imports unfolded ICS and preserves supported recurrence', () => {
    const imported = importIcs(exportIcs([event], [person], 'Our week'), person.id);
    expect(imported).toHaveLength(1);
    expect(imported[0]).toMatchObject({
      title: event.title, location: event.location, recurrence: 'weekly', recurrenceUntil: '2026-12-14'
    });
    expect(imported[0].start).toBe(event.start);
  });

  it('gives a useful error when an ICS contains no events', () => {
    expect(() => importIcs('BEGIN:VCALENDAR\nEND:VCALENDAR', person.id)).toThrow('No calendar events');
  });

  it('converts IANA TZID local times to the correct instant', () => {
    const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:tz-test\r\nSUMMARY:Breakfast\r\nDTSTART;TZID=America/New_York:20260824T073000\r\nDTEND;TZID=America/New_York:20260824T083000\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const imported = importIcs(ics, person.id)[0];
    expect(imported.start).toBe('2026-08-24T11:30:00.000Z');
    expect(imported.end).toBe('2026-08-24T12:30:00.000Z');
  });
});

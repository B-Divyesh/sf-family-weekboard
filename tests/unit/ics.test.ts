import { afterEach, describe, expect, it } from 'vitest';
import { exportIcs, importIcs } from '../../src/ics';
import { eventDays, occurrencesInRange } from '../../src/dates';
import type { BoardEvent, Person } from '../../src/models';

const person: Person = { id: 'person-1', name: 'Mum, Dad & kids', color: '#087d96', createdAt: '2026-08-20T00:00:00.000Z' };
const event: BoardEvent = {
  id: 'school-run', title: 'School run, then library', personId: person.id,
  start: '2026-08-24T07:30:00.000Z', end: '2026-08-24T08:45:00.000Z', allDay: false,
  location: 'North; gate', notes: 'Bring books\nand card', recurrence: 'weekly', recurrenceUntil: '2026-12-14',
  updatedAt: '2026-08-20T10:00:00.000Z'
};

describe('ICS interoperability', () => {
  const originalTimeZone = process.env.TZ;
  afterEach(() => { process.env.TZ = originalTimeZone; });
  it('exports valid UTC dates, escaped text, person colour notes, and RRULE', () => {
    const ics = exportIcs([event], [person], 'Our week');
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART:20260824T073000Z');
    expect(ics).toContain('SUMMARY:School run\\, then library');
    expect(ics).toContain('LOCATION:North\\; gate');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;UNTIL=20261214T073000Z');
    expect(ics).toContain('Weekboard person: Mum\\, Dad & kids\\nWeekboard colour: #087d96');
  });

  it('imports unfolded ICS and preserves supported recurrence', () => {
    const imported = importIcs(exportIcs([event], [person], 'Our week'), person.id);
    expect(imported).toHaveLength(1);
    expect(imported[0]).toMatchObject({
      title: event.title, location: event.location, recurrence: 'weekly', recurrenceUntil: '2026-12-14T07:30:00.000Z'
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

  it('does not silently misrepresent an advanced recurrence rule', () => {
    const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Classes\r\nDTSTART:20260824T100000Z\r\nDTEND:20260824T110000Z\r\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const imported = importIcs(ics, person.id)[0];
    expect(imported.recurrence).toBe('none');
    expect(imported.notes).toContain('not expanded');
    expect(imported.notes).toContain('BYDAY=MO,WE');
  });

  it('uses the next local midnight when an all-day DTEND is omitted', () => {
    process.env.TZ = 'America/New_York';
    const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Spring holiday\r\nDTSTART;VALUE=DATE:20270314\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const imported = importIcs(ics, person.id)[0];
    const occurrence = occurrencesInRange([imported], new Date(2027, 2, 14), new Date(2027, 2, 16))[0];
    expect(eventDays(occurrence)).toEqual(['2027-03-14']);
    expect(new Date(imported.end).getHours()).toBe(0);
  });

  it('preserves a UTC timestamp UNTIL and excludes starts after it', () => {
    process.env.TZ = 'UTC';
    const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Evening task\r\nDTSTART:20260824T180000Z\r\nDTEND:20260824T183000Z\r\nRRULE:FREQ=DAILY;UNTIL=20260826T120000Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const imported = importIcs(ics, person.id)[0];
    expect(imported.recurrenceUntil).toBe('2026-08-26T12:00:00.000Z');
    expect(occurrencesInRange([imported], new Date('2026-08-24T00:00:00Z'), new Date('2026-08-28T00:00:00Z')).map((item) => item.occurrenceStart.toISOString())).toEqual([
      '2026-08-24T18:00:00.000Z', '2026-08-25T18:00:00.000Z'
    ]);
    expect(exportIcs([imported], [person], 'Our week')).toContain('UNTIL=20260826T120000Z');
  });

  it('round-trips a local timed repeat through its selected final civil day', () => {
    process.env.TZ = 'America/New_York';
    const lateMedicine: BoardEvent = {
      ...event, id: 'late-medicine', title: 'Late medicine', start: '2026-08-25T00:00:00.000Z', end: '2026-08-25T00:30:00.000Z',
      recurrence: 'daily', recurrenceUntil: '2026-08-26'
    };
    const ics = exportIcs([lateMedicine], [person], 'Our week');
    expect(ics).toContain('DTSTART:20260825T000000Z');
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20260827T000000Z');
    const imported = importIcs(ics, person.id);
    expect(occurrencesInRange(imported, new Date(2026, 7, 24), new Date(2026, 7, 28)).map((item) => item.occurrenceStart.toISOString())).toEqual([
      '2026-08-25T00:00:00.000Z', '2026-08-26T00:00:00.000Z', '2026-08-27T00:00:00.000Z'
    ]);
  });

  it('uses a DATE UNTIL for an all-day recurrence and preserves its final day', () => {
    process.env.TZ = 'America/New_York';
    const schoolBreak: BoardEvent = {
      ...event, id: 'school-break', title: 'School break', allDay: true,
      start: '2026-08-24T04:00:00.000Z', end: '2026-08-25T04:00:00.000Z', recurrence: 'daily', recurrenceUntil: '2026-08-26'
    };
    const ics = exportIcs([schoolBreak], [person], 'Our week');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260824');
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20260826');
    expect(ics).not.toContain('UNTIL=20260826T');
    const imported = importIcs(ics, person.id);
    expect(occurrencesInRange(imported, new Date(2026, 7, 24), new Date(2026, 7, 28)).flatMap(eventDays)).toEqual([
      '2026-08-24', '2026-08-25', '2026-08-26'
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { dateKey, eventDays, occurrencesInRange, startOfWeek } from '../../src/dates';
import type { BoardEvent } from '../../src/models';

function plan(overrides: Partial<BoardEvent> = {}): BoardEvent {
  return {
    id: 'plan-1', title: 'Bins out', personId: 'person-1',
    start: '2026-08-24T07:00:00.000Z', end: '2026-08-24T07:15:00.000Z',
    allDay: false, location: '', notes: '', recurrence: 'none', updatedAt: '2026-08-20T00:00:00.000Z',
    ...overrides
  };
}

describe('week and recurrence calculations', () => {
  it('starts weeks on Monday, including Sundays', () => {
    expect(dateKey(startOfWeek(new Date(2026, 7, 30, 10)))).toBe('2026-08-24');
    expect(dateKey(startOfWeek(new Date(2026, 7, 31, 10)))).toBe('2026-08-31');
  });

  it('expands a weekly plan only inside the visible range', () => {
    const events = occurrencesInRange(
      [plan({ recurrence: 'weekly' })],
      new Date('2026-08-31T00:00:00.000Z'), new Date('2026-09-14T00:00:00.000Z')
    );
    expect(events.map((event) => event.occurrenceStart.toISOString())).toEqual([
      '2026-08-31T07:00:00.000Z', '2026-09-07T07:00:00.000Z'
    ]);
  });

  it('honours a recurrence end date', () => {
    const events = occurrencesInRange(
      [plan({ recurrence: 'daily', recurrenceUntil: '2026-08-26' })],
      new Date('2026-08-24T00:00:00.000Z'), new Date('2026-09-01T00:00:00.000Z')
    );
    expect(events).toHaveLength(3);
  });

  it('lists every day occupied by a multi-day all-day plan without the exclusive end', () => {
    const occurrence = occurrencesInRange(
      [plan({ start: '2026-08-24T00:00:00.000Z', end: '2026-08-27T00:00:00.000Z', allDay: true })],
      new Date('2026-08-24T00:00:00.000Z'), new Date('2026-09-01T00:00:00.000Z')
    )[0];
    expect(eventDays(occurrence)).toEqual(['2026-08-24', '2026-08-25', '2026-08-26']);
  });

  it('keeps the intended day after a short month', () => {
    const events = occurrencesInRange(
      [plan({ start: '2027-01-31T09:00:00.000Z', end: '2027-01-31T10:00:00.000Z', recurrence: 'monthly' })],
      new Date('2027-01-01T00:00:00.000Z'), new Date('2027-04-02T00:00:00.000Z')
    );
    expect(events.map((item) => item.occurrenceStart.toISOString().slice(0, 10))).toEqual(['2027-01-31', '2027-02-28', '2027-03-31']);
  });

  it('keeps a recurring all-day plan to one civil day across autumn DST', () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const start = new Date(2027, 10, 7);
      const end = new Date(2027, 10, 8);
      const events = occurrencesInRange(
        [plan({ start: start.toISOString(), end: end.toISOString(), allDay: true, recurrence: 'weekly', recurrenceUntil: '2027-11-21' })],
        new Date(2027, 10, 15), new Date(2027, 10, 22)
      );
      expect(events).toHaveLength(1);
      expect(eventDays(events[0])).toEqual(['2027-11-21']);
    } finally {
      process.env.TZ = originalTimeZone;
    }
  });

  it('honours an exact timed recurrence limit', () => {
    const events = occurrencesInRange(
      [plan({
        start: '2026-08-24T18:00:00.000Z', end: '2026-08-24T18:30:00.000Z',
        recurrence: 'daily', recurrenceUntil: '2026-08-26T12:00:00.000Z'
      })],
      new Date('2026-08-24T00:00:00.000Z'), new Date('2026-08-28T00:00:00.000Z')
    );
    expect(events.map((item) => item.occurrenceStart.toISOString())).toEqual([
      '2026-08-24T18:00:00.000Z', '2026-08-25T18:00:00.000Z'
    ]);
  });
});

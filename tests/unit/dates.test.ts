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
});

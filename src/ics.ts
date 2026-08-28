import type { BoardEvent, Person } from './models';

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function unescapeIcs(value: string): string {
  return value.replace(/\\[nN]/g, '\n').replace(/\\([,;\\])/g, '$1');
}

function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function dateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function fold(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 73) {
    let at = Math.min(73, rest.length);
    while (new TextEncoder().encode(rest.slice(0, at)).length > 73) at--;
    chunks.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  chunks.push(rest);
  return chunks.join('\r\n ');
}

export function exportIcs(events: BoardEvent[], people: Person[], boardName: string): string {
  const names = new Map(people.map((person) => [person.id, person.name]));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sociobot//Weekboard 1.0//EN', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${escapeIcs(boardName)}`];
  events.forEach((event) => {
    lines.push('BEGIN:VEVENT', `UID:${event.id}@family-weekboard.sociobot.in`, `DTSTAMP:${stamp(new Date(event.updatedAt))}`);
    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${dateOnly(new Date(event.start))}`, `DTEND;VALUE=DATE:${dateOnly(new Date(event.end))}`);
    } else {
      lines.push(`DTSTART:${stamp(new Date(event.start))}`, `DTEND:${stamp(new Date(event.end))}`);
    }
    lines.push(`SUMMARY:${escapeIcs(event.title)}`);
    if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
    const person = names.get(event.personId);
    const description = [person ? `Weekboard lane: ${person}` : '', event.notes].filter(Boolean).join('\n');
    if (description) lines.push(`DESCRIPTION:${escapeIcs(description)}`);
    if (event.recurrence !== 'none') {
      const frequency = event.recurrence.toUpperCase();
      const until = event.recurrenceUntil
        ? `;UNTIL=${/^\d{4}-\d{2}-\d{2}$/.test(event.recurrenceUntil) ? `${event.recurrenceUntil.replace(/-/g, '')}T235959Z` : stamp(new Date(event.recurrenceUntil))}`
        : '';
      lines.push(`RRULE:FREQ=${frequency}${until}`);
    }
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

function zonedDate(value: string, timeZone: string): Date {
  const fields = {
    year: Number(value.slice(0, 4)), month: Number(value.slice(4, 6)), day: Number(value.slice(6, 8)),
    hour: Number(value.slice(9, 11)), minute: Number(value.slice(11, 13)), second: Number(value.slice(13, 15) || 0)
  };
  let guess = Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second);
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    // Two passes handle DST offsets around the guessed UTC instant.
    for (let pass = 0; pass < 2; pass++) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
      const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
      guess += Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second) - represented;
    }
    return new Date(guess);
  } catch {
    return new Date(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second);
  }
}

function parseDate(value: string, allDay: boolean, params = ''): Date {
  if (allDay) return new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)));
  if (/Z$/.test(value)) {
    return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`);
  }
  const timeZone = params.match(/(?:^|;)TZID=([^;:]+)/)?.[1];
  if (timeZone) return zonedDate(value, timeZone);
  return new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)), Number(value.slice(9, 11)), Number(value.slice(11, 13)), Number(value.slice(13, 15) || 0));
}

export function importIcs(source: string, defaultPersonId: string): BoardEvent[] {
  const unfolded = source.replace(/\r?\n[ \t]/g, '');
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  if (!blocks.length) throw new Error('No calendar events were found in that ICS file.');
  const now = new Date().toISOString();
  return blocks.map((block) => {
    const values = new Map<string, { params: string; value: string }>();
    block.split(/\r?\n/).forEach((line) => {
      const colon = line.indexOf(':');
      if (colon < 0) return;
      const left = line.slice(0, colon);
      const [name, ...params] = left.split(';');
      values.set(name, { params: params.join(';'), value: line.slice(colon + 1) });
    });
    const startRaw = values.get('DTSTART');
    if (!startRaw) throw new Error('An imported event has no start date.');
    const allDay = startRaw.params.includes('VALUE=DATE');
    const start = parseDate(startRaw.value, allDay, startRaw.params);
    const endRaw = values.get('DTEND');
    const end = endRaw ? parseDate(endRaw.value, allDay, endRaw.params) : allDay
      ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
      : new Date(start.getTime() + 3_600_000);
    const rule = values.get('RRULE')?.value ?? '';
    const simpleRule = rule.split(';').filter(Boolean).every((part) => /^(FREQ=(DAILY|WEEKLY|MONTHLY)|UNTIL=\d{8}(T\d{6}Z)?)$/.test(part));
    const frequency = simpleRule ? (rule.match(/FREQ=(DAILY|WEEKLY|MONTHLY)/)?.[1]?.toLowerCase() ?? 'none') : 'none';
    const untilRaw = rule.match(/UNTIL=(\d{8}(?:T\d{6}Z)?)/)?.[1];
    const recurrenceUntil = untilRaw?.includes('T')
      ? parseDate(untilRaw, false).toISOString()
      : untilRaw ? `${untilRaw.slice(0, 4)}-${untilRaw.slice(4, 6)}-${untilRaw.slice(6, 8)}` : undefined;
    const importedNotes = unescapeIcs(values.get('DESCRIPTION')?.value || '');
    const recurrenceNote = rule && !simpleRule ? `Imported recurrence rule (not expanded): ${rule}` : '';
    return {
      id: (values.get('UID')?.value.split('@')[0] || crypto.randomUUID()) + `-${crypto.randomUUID().slice(0, 6)}`,
      title: unescapeIcs(values.get('SUMMARY')?.value || 'Untitled plan'),
      personId: defaultPersonId,
      start: start.toISOString(), end: end.toISOString(), allDay,
      location: unescapeIcs(values.get('LOCATION')?.value || ''),
      notes: [importedNotes, recurrenceNote].filter(Boolean).join('\n'),
      recurrence: frequency as BoardEvent['recurrence'],
      recurrenceUntil: simpleRule ? recurrenceUntil : undefined,
      updatedAt: now
    };
  });
}

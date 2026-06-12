import { dedupeEventsById, sortEventsByStart } from './utils';

describe('sortEventsByStart', () => {
  it('sorts events by start time ascending', () => {
    const sorted = sortEventsByStart([
      { id: 2, title: 'Later', start: '2026-06-11 14:00', end: '2026-06-11 15:00' },
      { id: 1, title: 'Earlier', start: '2026-06-11 09:00', end: '2026-06-11 10:00' }
    ]);
    expect(sorted.map(event => event.id)).toEqual([1, 2]);
  });
});

describe('dedupeEventsById', () => {
  it('keeps the last event for duplicate ids', () => {
    const deduped = dedupeEventsById([
      { id: 1, title: 'First', start: '2026-06-11 09:00', end: '2026-06-11 10:00' },
      { id: 1, title: 'Second', start: '2026-06-11 11:00', end: '2026-06-11 12:00' }
    ]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].title).toBe('Second');
  });
});

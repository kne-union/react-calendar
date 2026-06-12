import dayjs from 'dayjs';
import { groupEventsByDate, generateTimeSlots, normalizeEvent } from './events';

describe('normalizeEvent', () => {
  it('extends end when end is not after start', () => {
    const normalized = normalizeEvent({
      id: 1,
      title: 'Test',
      start: '2026-06-11 10:00',
      end: '2026-06-11 10:00'
    });
    expect(normalized.end.isAfter(normalized.start)).toBe(true);
  });
});

describe('groupEventsByDate', () => {
  it('groups events by day and stores normalized dates', () => {
    const grouped = groupEventsByDate([
      {
        id: 1,
        title: 'Single day',
        start: '2026-06-11 10:00',
        end: '2026-06-11 11:00'
      },
      {
        id: 2,
        title: 'Multi day',
        start: '2026-06-11 22:00',
        end: '2026-06-12 01:00'
      }
    ]);

    expect(Object.keys(grouped)).toEqual(['2026-06-11', '2026-06-12']);
    expect(grouped['2026-06-11']).toHaveLength(2);
    expect(dayjs.isDayjs(grouped['2026-06-11'][0].start)).toBe(true);
  });
});

describe('generateTimeSlots', () => {
  const baseOptions = {
    date: '2026-06-11',
    timeUnit: 60,
    dayStart: '09:00',
    dayEnd: '12:00',
    mode: 'schedule'
  };

  it('marks free slots when no events overlap', () => {
    const slots = generateTimeSlots({ ...baseOptions, events: [] });
    expect(slots).toHaveLength(3);
    expect(slots.every(slot => slot.status === 'free')).toBe(true);
  });

  it('marks occupied slots when events overlap', () => {
    const slots = generateTimeSlots({
      ...baseOptions,
      events: [
        {
          id: 1,
          title: 'Meeting',
          start: '2026-06-11 09:30',
          end: '2026-06-11 10:30'
        }
      ]
    });
    expect(slots[0].status).toBe('occupied');
    expect(slots[1].status).toBe('occupied');
    expect(slots[2].status).toBe('free');
  });

  it('marks disabled slots from availableDateTime whitelist', () => {
    const slots = generateTimeSlots({
      ...baseOptions,
      events: [],
      availableDateTime: ({ slot }) => !!slot && dayjs(slot.start).hour() === 9
    });
    expect(slots[0].status).toBe('free');
    expect(slots[1].status).toBe('disabled');
    expect(slots[2].status).toBe('disabled');
  });

  it('respects disabledDateTime reason', () => {
    const slots = generateTimeSlots({
      ...baseOptions,
      events: [],
      disabledDateTime: ({ slot }) => {
        if (slot && dayjs(slot.start).hour() === 10) {
          return { disabled: true, reason: 'Lunch break' };
        }
        return false;
      }
    });
    expect(slots[1].status).toBe('disabled');
    expect(slots[1].disabledReason).toBe('Lunch break');
  });

  it('returns empty slots when dayEnd is not after dayStart', () => {
    const slots = generateTimeSlots({
      ...baseOptions,
      dayStart: '12:00',
      dayEnd: '09:00',
      events: []
    });
    expect(slots).toHaveLength(0);
  });
});

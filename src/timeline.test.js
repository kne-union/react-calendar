import dayjs from 'dayjs';
import { MINUTE_MS, clickSelectionRange, createSelectionRange, findOverlappingEvents, getFreeGap, layoutTimelineEvents, mergeDisabledSlots, moveSelectionRange, resizeSelectionRange, toBlockers } from './timeline';

const at = time => dayjs(`2026-06-12 ${time}`).valueOf();
const day = { startMs: at('09:00'), endMs: at('18:00') };
const step = 5 * MINUTE_MS;

describe('timeline', () => {
  it('lays overlapping events out in columns', () => {
    const items = layoutTimelineEvents(
      [
        { id: 1, start: at('09:00'), end: at('10:00') },
        { id: 2, start: at('09:30'), end: at('10:30') },
        { id: 3, start: at('11:00'), end: at('12:00') },
        { id: 4, start: at('08:00'), end: at('08:30') }
      ],
      day
    );
    expect(items.map(item => [item.event.id, item.column, item.columns])).toEqual([
      [1, 0, 2],
      [2, 1, 2],
      [3, 0, 1]
    ]);
  });

  it('clips events to the day window', () => {
    const [item] = layoutTimelineEvents([{ id: 1, start: at('08:00'), end: at('09:30') }], day);
    expect(item.startMs).toBe(day.startMs);
    expect(item.endMs).toBe(at('09:30'));
  });

  it('merges consecutive disabled slots', () => {
    const ranges = mergeDisabledSlots([
      { status: 'disabled', start: at('12:00'), end: at('12:30'), disabledReason: 'lunch' },
      { status: 'disabled', start: at('12:30'), end: at('13:00'), disabledReason: 'lunch' },
      { status: 'free', start: at('13:00'), end: at('13:30') }
    ]);
    expect(ranges).toEqual([{ startMs: at('12:00'), endMs: at('13:00'), reason: 'lunch' }]);
  });

  it('finds the free gap between blockers', () => {
    const blockers = toBlockers([
      { start: at('10:00'), end: at('11:00') },
      { start: at('14:00'), end: at('15:00') }
    ]);
    expect(getFreeGap(at('12:00'), blockers, day)).toEqual({ startMs: at('11:00'), endMs: at('14:00') });
    expect(getFreeGap(at('10:30'), blockers, day)).toBeNull();
    expect(getFreeGap(at('09:10'), blockers, day)).toEqual({ startMs: at('09:00'), endMs: at('10:00') });
  });

  it('creates a drag range clamped to the gap', () => {
    const gap = { startMs: at('11:00'), endMs: at('14:00') };
    expect(createSelectionRange({ anchorMs: at('12:02'), pointerMs: at('12:41'), gap, originMs: day.startMs, stepMs: step })).toEqual({ startMs: at('12:00'), endMs: at('12:45') });
    expect(createSelectionRange({ anchorMs: at('12:02'), pointerMs: at('10:00'), gap, originMs: day.startMs, stepMs: step })).toEqual({ startMs: at('11:00'), endMs: at('12:05') });
    expect(createSelectionRange({ anchorMs: at('12:02'), pointerMs: at('16:00'), gap, originMs: day.startMs, stepMs: step }).endMs).toBe(at('14:00'));
  });

  it('fits a click range into a short gap', () => {
    const gap = { startMs: at('11:00'), endMs: at('11:20') };
    expect(clickSelectionRange({ pointerMs: at('11:10'), gap, originMs: day.startMs, unitMs: 30 * MINUTE_MS })).toEqual({ startMs: at('11:00'), endMs: at('11:20') });
  });

  it('moves and resizes inside the gap', () => {
    const gap = { startMs: at('11:00'), endMs: at('14:00') };
    const range = { startMs: at('12:00'), endMs: at('13:00') };
    expect(moveSelectionRange({ range, deltaMs: 2 * 60 * MINUTE_MS, gap, originMs: day.startMs, stepMs: step })).toEqual({ startMs: at('13:00'), endMs: at('14:00') });
    expect(resizeSelectionRange({ range, edge: 'start', pointerMs: at('12:58'), gap, originMs: day.startMs, stepMs: step })).toEqual({ startMs: at('12:55'), endMs: at('13:00') });
    expect(resizeSelectionRange({ range, edge: 'end', pointerMs: at('15:00'), gap, originMs: day.startMs, stepMs: step })).toEqual({ startMs: at('12:00'), endMs: at('14:00') });
  });

  it('detects conflicting events', () => {
    const events = [
      { id: 1, start: at('10:00'), end: at('11:00') },
      { id: 2, start: at('11:00'), end: at('12:00') }
    ];
    expect(findOverlappingEvents({ startMs: at('10:30'), endMs: at('11:00') }, events).map(item => item.id)).toEqual([1]);
  });
});

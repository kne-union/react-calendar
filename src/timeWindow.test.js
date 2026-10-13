import dayjs from 'dayjs';
import { buildScaleTicks, clampWindowStart, consumeWheelSteps, createTimeWindow, estimateVelocity, formatTimeWindow, resizeTimeWindow, resolveInertia, resolveRange, resolveStep, timeAtClientX, wheelDeltaToPx } from './timeWindow';

const at = value => dayjs(value);

describe('resolveRange', () => {
  it('defaults to the full current day', () => {
    const [start, end] = resolveRange(undefined, '2026-07-21 15:30:00');
    expect(start.format('YYYY-MM-DD HH:mm')).toBe('2026-07-21 00:00');
    expect(end.format('YYYY-MM-DD HH:mm')).toBe('2026-07-22 00:00');
  });

  it('uses a valid custom range', () => {
    const [start, end] = resolveRange(['2026-07-21 09:00', '2026-07-21 18:00']);
    expect(start.format('HH:mm')).toBe('09:00');
    expect(end.format('HH:mm')).toBe('18:00');
  });
});

describe('clampWindowStart', () => {
  const rangeStart = at('2026-07-21 00:00:00');
  const rangeEnd = at('2026-07-22 00:00:00');

  it('snaps to the step grid and keeps the window inside the range', () => {
    const start = clampWindowStart('2026-07-21 09:07', {
      rangeStart,
      rangeEnd,
      duration: 60,
      step: 15
    });
    expect(start.format('HH:mm')).toBe('09:00');
  });

  it('keeps the exact minute when scrolling without a step snap', () => {
    const start = clampWindowStart('2026-07-21 09:07:30', {
      rangeStart,
      rangeEnd,
      duration: 60,
      step: 30,
      snap: false
    });
    expect(start.format('HH:mm:ss')).toBe('09:07:30');
  });

  it('defaults the step to one minute', () => {
    const start = clampWindowStart('2026-07-21 09:07', {
      rangeStart,
      rangeEnd,
      duration: 60,
      step: resolveStep()
    });
    expect(start.format('HH:mm')).toBe('09:07');
  });

  it('clamps the start so the duration does not pass the range end', () => {
    const start = clampWindowStart('2026-07-21 23:50', {
      rangeStart,
      rangeEnd,
      duration: 60,
      step: 15
    });
    expect(start.format('YYYY-MM-DD HH:mm')).toBe('2026-07-21 23:00');
  });
});

describe('createTimeWindow', () => {
  it('uses the day of the anchor as the default range', () => {
    const window = createTimeWindow({
      start: '2026-07-21 09:00',
      now: at('2026-07-21 09:00').startOf('day').valueOf()
    });
    expect(window.start.format('YYYY-MM-DD HH:mm')).toBe('2026-07-21 09:00');
    expect(window.rangeEnd.format('YYYY-MM-DD HH:mm')).toBe('2026-07-22 00:00');
  });

  it('starts at the beginning of the range when no start is given', () => {
    const window = createTimeWindow({
      now: '2026-07-21 11:00:00',
      duration: 60,
      step: 15
    });
    expect(window.start.format('YYYY-MM-DD HH:mm')).toBe('2026-07-21 00:00');
    expect(window.end.format('YYYY-MM-DD HH:mm')).toBe('2026-07-21 01:00');
  });
});

describe('formatTimeWindow', () => {
  const start = '2026-07-21 09:00';
  const end = '2026-07-21 10:00';

  it('formats start and end with the default pattern and separator', () => {
    expect(formatTimeWindow({ start, end })).toBe('2026-07-21 09:00 ～ 10:00');
  });

  it('uses a custom separator', () => {
    expect(formatTimeWindow({ start, end, separator: ' 至 ' })).toBe('2026-07-21 09:00 至 10:00');
  });

  it('applies one format string to both sides', () => {
    expect(formatTimeWindow({ start, end, format: 'HH:mm' })).toBe('09:00 ～ 10:00');
  });

  it('keeps the end format when the window crosses midnight', () => {
    expect(
      formatTimeWindow({
        start: '2026-07-21 23:00',
        end: '2026-07-22 00:00',
        format: ['YYYY-MM-DD HH:mm', 'HH:mm'],
        separator: ' - '
      })
    ).toBe('2026-07-21 23:00 - 00:00');
  });

  it('returns the function result without inserting the separator', () => {
    expect(
      formatTimeWindow({
        start,
        end,
        separator: '至',
        format: (windowStart, windowEnd) => `${windowStart.getHours()}-${windowEnd.getHours()}`
      })
    ).toBe('9-10');
  });
});

describe('unbounded range', () => {
  it('treats null as no limit on both sides', () => {
    expect(resolveRange(null)).toEqual([null, null]);
  });

  it('keeps one open side', () => {
    const [start, end] = resolveRange(['2026-07-21 09:00', null]);
    expect(start.format('HH:mm')).toBe('09:00');
    expect(end).toBeNull();
  });

  it('moves freely across days without a range', () => {
    const window = createTimeWindow({ start: '2026-07-23 23:30', duration: 60, range: null });
    expect(window.start.format('YYYY-MM-DD HH:mm')).toBe('2026-07-23 23:30');
    expect(window.end.format('YYYY-MM-DD HH:mm')).toBe('2026-07-24 00:30');
  });

  it('still clamps the bounded side', () => {
    const window = createTimeWindow({ start: '2026-07-21 08:00', duration: 60, range: ['2026-07-21 09:00', null] });
    expect(window.start.format('HH:mm')).toBe('09:00');
  });

  it('shows the end date when the default format crosses into another day', () => {
    expect(formatTimeWindow({ start: '2026-07-21 23:30', end: '2026-07-22 00:30' })).toBe('2026-07-21 23:30 ～ 07-22 00:30');
  });
});

describe('resizeTimeWindow', () => {
  const startMs = at('2026-07-21 09:00:00').valueOf();
  const endMs = at('2026-07-21 10:00:00').valueOf();
  const base = { startMs, endMs, step: 15 };

  it('moves the end edge and snaps to the step', () => {
    const result = resizeTimeWindow({ ...base, edge: 'end', pointerMs: at('2026-07-21 10:37:00').valueOf() });
    expect(result.startMs).toBe(startMs);
    expect(result.duration).toBe(90);
  });

  it('moves the start edge while keeping the end', () => {
    const result = resizeTimeWindow({ ...base, edge: 'start', pointerMs: at('2026-07-21 08:20:00').valueOf() });
    expect(at(result.startMs).format('HH:mm')).toBe('08:15');
    expect(result.duration).toBe(105);
  });

  it('keeps the minimum and maximum duration', () => {
    expect(resizeTimeWindow({ ...base, edge: 'end', pointerMs: startMs, minDuration: 30 }).duration).toBe(30);
    expect(resizeTimeWindow({ ...base, edge: 'start', pointerMs: at('2026-07-21 04:00:00').valueOf(), maxDuration: 120 }).duration).toBe(120);
  });

  it('stops at the range bounds', () => {
    const result = resizeTimeWindow({ ...base, edge: 'end', pointerMs: at('2026-07-21 20:00:00').valueOf(), rangeEnd: at('2026-07-21 18:00:00') });
    expect(result.duration).toBe(540);
  });
});

describe('inertia', () => {
  it('resolves the strength to a decay time constant', () => {
    expect(resolveInertia()).toBe(325);
    expect(resolveInertia(true)).toBe(325);
    expect(resolveInertia(2)).toBe(650);
    expect(resolveInertia(false)).toBe(0);
    expect(resolveInertia(0)).toBe(0);
  });

  it('estimates velocity from recent samples only', () => {
    const samples = [
      { t: 0, ms: 0 },
      { t: 200, ms: 1000 },
      { t: 250, ms: 6000 },
      { t: 300, ms: 11000 }
    ];
    expect(estimateVelocity(samples, 300)).toBe(100);
  });

  it('drops the velocity when the pointer stopped before release', () => {
    expect(
      estimateVelocity(
        [
          { t: 0, ms: 0 },
          { t: 50, ms: 5000 }
        ],
        400
      )
    ).toBe(0);
  });
});

describe('consumeWheelSteps', () => {
  it('turns accumulated trackpad pixels into whole steps', () => {
    const first = consumeWheelSteps({ accumulatedPx: 0, deltaPx: 3, pxPerStep: 5 });
    expect(first).toEqual({ steps: 0, accumulatedPx: 3 });
    const second = consumeWheelSteps({ accumulatedPx: first.accumulatedPx, deltaPx: 8, pxPerStep: 5 });
    expect(second.steps).toBe(2);
    expect(second.accumulatedPx).toBe(1);
  });

  it('moves at least one step per discrete wheel notch', () => {
    expect(consumeWheelSteps({ accumulatedPx: 0, deltaPx: -100, pxPerStep: 400, discrete: true })).toEqual({ steps: -1, accumulatedPx: 0 });
  });

  it('resets the remainder when the direction changes', () => {
    expect(consumeWheelSteps({ accumulatedPx: 4, deltaPx: -2, pxPerStep: 5 })).toEqual({ steps: 0, accumulatedPx: -2 });
  });

  it('converts line deltas to pixels', () => {
    expect(wheelDeltaToPx({ delta: 3, deltaMode: 1 })).toBe(48);
  });
});

describe('timeAtClientX', () => {
  const rangeStartMs = at('2026-07-21 09:00:00').valueOf();
  const rangeEndMs = at('2026-07-21 18:00:00').valueOf();

  it('maps a click on the office-hours track to that time', () => {
    const pointerMs = timeAtClientX({
      clientX: 400,
      rectLeft: 0,
      rectWidth: 900,
      rangeStartMs,
      rangeEndMs
    });
    expect(at(pointerMs).format('HH:mm')).toBe('13:00');
  });

  it('keeps the grab point when dragging the 30 minute window', () => {
    const pointerMs = timeAtClientX({
      clientX: 450,
      rectLeft: 0,
      rectWidth: 900,
      rangeStartMs,
      rangeEndMs,
      grabOffsetMs: 15 * 60 * 1000
    });
    expect(at(pointerMs).format('HH:mm')).toBe('13:15');
  });
});

describe('buildScaleTicks density', () => {
  const start = at('2026-07-21 00:00:00');
  const end = at('2026-07-22 00:00:00');

  it('shows fewer labels on a narrow track', () => {
    const narrow = buildScaleTicks(start, end, { trackWidth: 300 }).filter(tick => tick.showLabel);
    const wide = buildScaleTicks(start, end, { trackWidth: 1200 }).filter(tick => tick.showLabel);
    expect(narrow.length).toBeLessThan(wide.length);
    expect(narrow.length).toBeLessThanOrEqual(6);
  });

  it('adds half-hour minor ticks when there is room', () => {
    const ticks = buildScaleTicks(at('2026-07-21 09:00:00'), at('2026-07-21 18:00:00'), { trackWidth: 900 });
    expect(ticks.some(tick => !tick.major)).toBe(true);
  });

  it('only renders ticks inside the viewport and marks the date at midnight', () => {
    const ticks = buildScaleTicks(at('2026-07-21 21:10:00'), at('2026-07-22 03:10:00'), { trackWidth: 600 });
    expect(ticks[0].key).toBeGreaterThanOrEqual(at('2026-07-21 21:10:00').valueOf());
    expect(ticks.every(tick => tick.ratio >= 0 && tick.ratio <= 1)).toBe(true);
    expect(ticks.find(tick => tick.label === '07-22')).toBeTruthy();
  });

  it('assigns day, hour, half and minute levels', () => {
    const ticks = buildScaleTicks(at('2026-07-21 23:00:00'), at('2026-07-22 01:00:00'), { trackWidth: 300 });
    const levelAt = time => ticks.find(tick => tick.key === at(time).valueOf()).level;
    expect(levelAt('2026-07-22 00:00:00')).toBe('day');
    expect(levelAt('2026-07-21 23:00:00')).toBe('hour');
    expect(levelAt('2026-07-21 23:30:00')).toBe('half');
    expect(levelAt('2026-07-21 23:15:00')).toBe('quarter');
    expect(levelAt('2026-07-21 23:10:00')).toBe('minute');
  });

  it('flags ticks outside the selectable range', () => {
    const ticks = buildScaleTicks(at('2026-07-21 06:00:00'), at('2026-07-21 12:00:00'), {
      trackWidth: 600,
      rangeStart: at('2026-07-21 09:00:00')
    });
    expect(ticks.find(tick => tick.label === '08:00').outOfRange).toBe(true);
    expect(ticks.find(tick => tick.label === '10:00').outOfRange).toBe(false);
  });
});

describe('buildScaleTicks', () => {
  it('labels every third hour across a full day', () => {
    const ticks = buildScaleTicks(at('2026-07-21 00:00:00'), at('2026-07-22 00:00:00'));
    const labels = ticks.filter(tick => tick.showLabel).map(tick => tick.label);
    expect(labels).toContain('07-21');
    expect(labels).toContain('12:00');
    expect(labels).not.toContain('01:00');
  });
});

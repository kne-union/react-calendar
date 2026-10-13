import dayjs from 'dayjs';

export const MINUTE_MS = 60 * 1000;

const toMs = value => {
  if (value === null || typeof value === 'undefined') {
    return NaN;
  }
  if (typeof value === 'number') {
    return value;
  }
  const date = dayjs(value);
  return date.isValid() ? date.valueOf() : NaN;
};

export const snapToStep = (ms, { originMs, stepMs, mode = 'round' }) => {
  const fn = mode === 'floor' ? Math.floor : mode === 'ceil' ? Math.ceil : Math.round;
  return originMs + fn((ms - originMs) / stepMs) * stepMs;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Clip events to the day window and lay overlapping ones out side by side.
 * Returns `{ event, startMs, endMs, column, columns }` sorted by start.
 */
export const layoutTimelineEvents = (events, { startMs, endMs }) => {
  const items = (events || [])
    .map(event => {
      const s = Math.max(toMs(event.start), startMs);
      const e = Math.min(toMs(event.end), endMs);
      return { event, startMs: s, endMs: e };
    })
    .filter(item => Number.isFinite(item.startMs) && Number.isFinite(item.endMs) && item.endMs > item.startMs)
    .sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs);

  let cluster = [];
  let clusterEnd = -Infinity;
  let columnEnds = [];
  const flush = () => {
    cluster.forEach(item => {
      item.columns = columnEnds.length;
    });
    cluster = [];
    columnEnds = [];
  };
  items.forEach(item => {
    if (item.startMs >= clusterEnd) {
      flush();
      clusterEnd = -Infinity;
    }
    let column = columnEnds.findIndex(end => end <= item.startMs);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(item.endMs);
    } else {
      columnEnds[column] = item.endMs;
    }
    item.column = column;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMs);
  });
  flush();
  return items;
};

/** Merge consecutive disabled slots (same reason) into ranges. */
export const mergeDisabledSlots = slots => {
  const ranges = [];
  (slots || []).forEach(slot => {
    if (slot.status !== 'disabled') {
      return;
    }
    const startMs = toMs(slot.start);
    const endMs = toMs(slot.end);
    const last = ranges[ranges.length - 1];
    if (last && last.endMs === startMs && last.reason === slot.disabledReason) {
      last.endMs = endMs;
      return;
    }
    ranges.push({ startMs, endMs, reason: slot.disabledReason });
  });
  return ranges;
};

export const toBlockers = ranges =>
  (ranges || [])
    .map(range => ({ startMs: toMs(range.startMs ?? range.start), endMs: toMs(range.endMs ?? range.end) }))
    .filter(range => Number.isFinite(range.startMs) && Number.isFinite(range.endMs) && range.endMs > range.startMs)
    .sort((a, b) => a.startMs - b.startMs);

/**
 * The free gap around `ms` between blockers, bounded by the day window.
 * Returns null when `ms` falls inside a blocker.
 */
export const getFreeGap = (ms, blockers, { startMs, endMs }) => {
  let gapStart = startMs;
  let gapEnd = endMs;
  for (const blocker of blockers || []) {
    if (blocker.startMs <= ms && ms < blocker.endMs) {
      return null;
    }
    if (blocker.endMs <= ms) {
      gapStart = Math.max(gapStart, blocker.endMs);
    } else if (blocker.startMs > ms) {
      gapEnd = Math.min(gapEnd, blocker.startMs);
    }
  }
  if (ms < startMs || ms >= endMs || gapEnd <= gapStart) {
    return null;
  }
  return { startMs: gapStart, endMs: gapEnd };
};

/** Range created by pressing at `anchorMs` and dragging to `pointerMs`, kept inside `gap`. */
export const createSelectionRange = ({ anchorMs, pointerMs, gap, originMs, stepMs }) => {
  const anchorStart = clamp(snapToStep(anchorMs, { originMs, stepMs, mode: 'floor' }), gap.startMs, gap.endMs);
  const anchorEnd = Math.min(anchorStart + stepMs, gap.endMs);
  const pointer = clamp(pointerMs, gap.startMs, gap.endMs);
  if (pointer >= anchorStart) {
    const end = clamp(snapToStep(pointer, { originMs, stepMs, mode: 'ceil' }), anchorEnd, gap.endMs);
    return { startMs: anchorStart, endMs: end };
  }
  const start = clamp(snapToStep(pointer, { originMs, stepMs, mode: 'floor' }), gap.startMs, anchorStart);
  return { startMs: start, endMs: anchorEnd };
};

/** Default range for a single click: one `unitMs` block that contains the pointer, fitted into `gap`. */
export const clickSelectionRange = ({ pointerMs, gap, originMs, unitMs }) => {
  const duration = Math.min(unitMs, gap.endMs - gap.startMs);
  const start = clamp(snapToStep(pointerMs, { originMs, stepMs: unitMs, mode: 'floor' }), gap.startMs, gap.endMs - duration);
  return { startMs: start, endMs: start + duration };
};

export const moveSelectionRange = ({ range, deltaMs, gap, originMs, stepMs }) => {
  const duration = range.endMs - range.startMs;
  const start = clamp(snapToStep(range.startMs + deltaMs, { originMs, stepMs }), gap.startMs, gap.endMs - duration);
  return { startMs: start, endMs: start + duration };
};

export const resizeSelectionRange = ({ range, edge, pointerMs, gap, originMs, stepMs, minMs = stepMs }) => {
  const snapped = snapToStep(pointerMs, { originMs, stepMs });
  if (edge === 'start') {
    const start = clamp(snapped, gap.startMs, range.endMs - minMs);
    return { startMs: start, endMs: range.endMs };
  }
  const end = clamp(snapped, range.startMs + minMs, gap.endMs);
  return { startMs: range.startMs, endMs: end };
};

export const findOverlappingEvents = (range, events) => {
  if (!range) {
    return [];
  }
  return (events || []).filter(event => toMs(event.start) < range.endMs && toMs(event.end) > range.startMs);
};

export const findOverlappingSlots = (range, slots) => {
  if (!range) {
    return [];
  }
  return (slots || []).filter(slot => toMs(slot.start) < range.endMs && toMs(slot.end) > range.startMs);
};

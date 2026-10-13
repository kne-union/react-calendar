import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const DEFAULT_DURATION = 60;
export const DEFAULT_STEP = 1;
export const DEFAULT_DEBOUNCE_WAIT = 300;
export const DEFAULT_SEPARATOR = ' ～ ';
export const DEFAULT_FORMAT = ['YYYY-MM-DD HH:mm', 'HH:mm'];
export const DEFAULT_MIN_VISIBLE_SPAN = 360;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const PARSE_FORMATS = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'];

export const parseDateLike = value => {
  if (value == null || value === '') {
    return null;
  }
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : null;
  }
  const direct = dayjs(value);
  if (direct.isValid()) {
    return direct;
  }
  if (typeof value === 'string') {
    const parsed = dayjs(value, PARSE_FORMATS, true);
    return parsed.isValid() ? parsed : null;
  }
  return null;
};

const isEmptyBound = value => value == null || value === '';

const defaultDayRange = now => {
  const day = (parseDateLike(now) || dayjs()).startOf('day');
  return [day, day.add(1, 'day')];
};

/**
 * `null` 或 `[null, null]` 表示不限制；单侧为空表示该侧不限制；`undefined` 为当天全天。
 */
export const resolveRange = (range, now = dayjs()) => {
  if (range === null) {
    return [null, null];
  }
  if (!Array.isArray(range)) {
    return defaultDayRange(now);
  }
  const start = isEmptyBound(range[0]) ? null : parseDateLike(range[0]);
  const end = isEmptyBound(range[1]) ? null : parseDateLike(range[1]);
  const startInvalid = !isEmptyBound(range[0]) && !start;
  const endInvalid = !isEmptyBound(range[1]) && !end;
  if (startInvalid || endInvalid || (start && end && !end.isAfter(start))) {
    return defaultDayRange(now);
  }
  return [start, end];
};

export const resolveDuration = (duration, rangeStart, rangeEnd) => {
  const requested = Number(duration) > 0 ? Number(duration) : DEFAULT_DURATION;
  if (!rangeStart || !rangeEnd) {
    return requested;
  }
  const rangeMinutes = rangeEnd.diff(rangeStart, 'minute');
  if (rangeMinutes > 0 && requested > rangeMinutes) {
    return rangeMinutes;
  }
  return requested;
};

export const resolveStep = step => (Number(step) > 0 ? Number(step) : DEFAULT_STEP);

export const resolveVisibleSpan = ({ visibleSpan, duration, baseDuration = duration, rangeStart, rangeEnd }) => {
  const minimum = duration * 1.5;
  let span = Number(visibleSpan) > 0 ? Number(visibleSpan) : Math.max(baseDuration * 6, DEFAULT_MIN_VISIBLE_SPAN);
  if (rangeStart && rangeEnd && !(Number(visibleSpan) > 0)) {
    span = Math.min(span, rangeEnd.diff(rangeStart, 'minute'));
  }
  return Math.max(span, minimum);
};

const snapMs = (ms, stepMs, mode = 'round') => {
  const anchor = dayjs(ms).startOf('day').valueOf();
  const units = (ms - anchor) / stepMs;
  const snapped = mode === 'floor' ? Math.floor(units) : mode === 'ceil' ? Math.ceil(units) : Math.round(units);
  return anchor + snapped * stepMs;
};

export const clampWindowStart = (startInput, { rangeStart, rangeEnd, duration, step, snap = true, now }) => {
  const durationMs = duration * MINUTE_MS;
  const minMs = rangeStart ? rangeStart.valueOf() : -Infinity;
  const maxMs = rangeEnd ? rangeEnd.valueOf() - durationMs : Infinity;
  if (maxMs <= minMs) {
    return dayjs(minMs);
  }
  const fallback = rangeStart || parseDateLike(now) || dayjs();
  const start = parseDateLike(startInput) || fallback;
  const stepMs = step * MINUTE_MS;
  let target = snap ? snapMs(start.valueOf(), stepMs) : start.valueOf();
  if (target > maxMs) {
    target = snap ? snapMs(maxMs, stepMs, 'floor') : maxMs;
  }
  if (target < minMs) {
    target = snap ? snapMs(minMs, stepMs, 'ceil') : minMs;
  }
  return dayjs(Math.min(Math.max(target, minMs), maxMs));
};

export const createTimeWindow = ({ start, duration, range, step, now, snap = true } = {}) => {
  const [rangeStart, rangeEnd] = resolveRange(range, now);
  const resolvedDuration = resolveDuration(duration, rangeStart, rangeEnd);
  const resolvedStep = resolveStep(step);
  const windowStart = clampWindowStart(start == null ? null : start, {
    rangeStart,
    rangeEnd,
    duration: resolvedDuration,
    step: resolvedStep,
    snap,
    now
  });
  return {
    start: windowStart,
    end: windowStart.add(resolvedDuration, 'minute'),
    rangeStart,
    rangeEnd,
    duration: resolvedDuration,
    step: resolvedStep
  };
};

/**
 * 拖动窗口一侧边界：另一侧保持不动，拖动侧按 step 吸附，并受最短 / 最长时长与范围约束。
 */
export const resizeTimeWindow = ({ edge, pointerMs, startMs, endMs, step, rangeStart, rangeEnd, minDuration, maxDuration }) => {
  const stepMs = resolveStep(step) * MINUTE_MS;
  const minMs = (Number(minDuration) > 0 ? Number(minDuration) : resolveStep(step)) * MINUTE_MS;
  const maxMs = Number(maxDuration) > 0 ? Number(maxDuration) * MINUTE_MS : Infinity;
  const rangeStartMs = rangeStart ? dayjs(rangeStart).valueOf() : -Infinity;
  const rangeEndMs = rangeEnd ? dayjs(rangeEnd).valueOf() : Infinity;
  if (edge === 'start') {
    let next = snapMs(pointerMs, stepMs);
    next = Math.min(next, endMs - minMs);
    next = Math.max(next, endMs - maxMs, rangeStartMs);
    return { startMs: next, duration: (endMs - next) / MINUTE_MS };
  }
  let next = snapMs(pointerMs, stepMs);
  next = Math.max(next, startMs + minMs);
  next = Math.min(next, startMs + maxMs, rangeEndMs);
  return { startMs, duration: (next - startMs) / MINUTE_MS };
};

export const toWindowValue = window => [window.start.toDate(), window.end.toDate()];

export const getViewport = ({ startMs, duration }, visibleSpanMinutes) => {
  const spanMs = visibleSpanMinutes * MINUTE_MS;
  const centerMs = startMs + (duration * MINUTE_MS) / 2;
  return { startMs: centerMs - spanMs / 2, endMs: centerMs + spanMs / 2, spanMs };
};

export const wheelDeltaToPx = ({ delta, deltaMode = 0, trackWidth }) => {
  if (deltaMode === 1) {
    return delta * 16;
  }
  if (deltaMode === 2) {
    return delta * (trackWidth > 0 ? trackWidth : 1);
  }
  return delta;
};

/**
 * 把滚轮像素累加为整步数：步数与刻度尺比例一致，单次离散滚动至少移动一步。
 */
export const consumeWheelSteps = ({ accumulatedPx, deltaPx, pxPerStep, discrete }) => {
  const sameDirection = accumulatedPx === 0 || Math.sign(accumulatedPx) === Math.sign(deltaPx);
  const total = (sameDirection ? accumulatedPx : 0) + deltaPx;
  const perStep = pxPerStep > 0 ? pxPerStep : 1;
  let steps = Math.trunc(total / perStep) || 0;
  let rest = total - steps * perStep;
  if (steps === 0 && discrete && deltaPx !== 0) {
    steps = Math.sign(deltaPx);
    rest = 0;
  }
  return { steps, accumulatedPx: rest };
};

export const DEFAULT_INERTIA_TIME_CONSTANT = 325;
const VELOCITY_WINDOW_MS = 120;

/**
 * `true` 为默认强度 1，数字为强度倍数，`false` / `0` 关闭。返回滑行衰减时间常数（ms），0 表示关闭。
 */
export const resolveInertia = inertia => {
  if (inertia === false || inertia == null) {
    return inertia == null ? DEFAULT_INERTIA_TIME_CONSTANT : 0;
  }
  if (inertia === true) {
    return DEFAULT_INERTIA_TIME_CONSTANT;
  }
  const strength = Number(inertia);
  return strength > 0 ? DEFAULT_INERTIA_TIME_CONSTANT * strength : 0;
};

/**
 * samples: [{ t, ms }]，按时间顺序；返回最近一段内每毫秒移动的时间量。
 */
export const estimateVelocity = (samples, now) => {
  if (!samples || samples.length < 2) {
    return 0;
  }
  const latest = samples[samples.length - 1];
  const reference = now == null ? latest.t : now;
  if (reference - latest.t > VELOCITY_WINDOW_MS / 2) {
    return 0;
  }
  const recent = samples.filter(sample => latest.t - sample.t <= VELOCITY_WINDOW_MS);
  if (recent.length < 2) {
    return 0;
  }
  const first = recent[0];
  const elapsed = latest.t - first.t;
  return elapsed > 0 ? (latest.ms - first.ms) / elapsed : 0;
};

export const timeAtClientX = ({ clientX, rectLeft, rectWidth, rangeStartMs, rangeEndMs, grabOffsetMs = 0 }) => {
  const span = Math.max(rangeEndMs - rangeStartMs, 1);
  const width = rectWidth > 0 ? rectWidth : 1;
  const ratio = Math.min(Math.max((clientX - rectLeft) / width, 0), 1);
  return rangeStartMs + ratio * span - grabOffsetMs;
};

export const formatTimeWindowParts = ({ start, end, format = DEFAULT_FORMAT }) => {
  const startDate = parseDateLike(start);
  const endDate = parseDateLike(end);
  if (!startDate || !endDate || typeof format === 'function') {
    return null;
  }
  const formats = Array.isArray(format) ? format : [format, format];
  const startText = startDate.format(formats[0] || DEFAULT_FORMAT[0]);
  let endFormat = formats[1] || formats[0] || DEFAULT_FORMAT[1];
  const endAtMidnight = endDate.valueOf() === endDate.startOf('day').valueOf();
  if (format === DEFAULT_FORMAT && !endAtMidnight && !endDate.isSame(startDate, 'day')) {
    endFormat = 'MM-DD HH:mm';
  }
  return [startText, endDate.format(endFormat)];
};

export const formatTimeWindow = ({ start, end, format = DEFAULT_FORMAT, separator = DEFAULT_SEPARATOR }) => {
  if (typeof format === 'function') {
    const startDate = parseDateLike(start);
    const endDate = parseDateLike(end);
    return startDate && endDate ? format(startDate.toDate(), endDate.toDate()) : '';
  }
  const parts = formatTimeWindowParts({ start, end, format });
  return parts ? `${parts[0]}${separator}${parts[1]}` : '';
};

const LABEL_INTERVALS = [1, 2, 3, 4, 6, 8, 12, 24];

const pickLabelEvery = (pxPerHour, minLabelPx) => {
  if (!(pxPerHour > 0)) {
    return 3;
  }
  return LABEL_INTERVALS.find(every => pxPerHour * every >= minLabelPx) || 24;
};

const TICK_MINUTES = [1, 2, 5, 10, 15, 30, 60];
const MIN_TICK_GAP_PX = 7;

const pickTickMinutes = (pxPerHour, labelEvery) => {
  const fit = TICK_MINUTES.find(minutes => (pxPerHour * minutes) / 60 >= MIN_TICK_GAP_PX);
  return fit || labelEvery * 60;
};

/**
 * 只生成当前视窗 [viewStart, viewEnd] 内的刻度；`outOfRange` 标出超出可选范围的刻度。
 */
export const buildScaleTicks = (viewStart, viewEnd, { trackWidth, rangeStart, rangeEnd, minLabelPx = 52 } = {}) => {
  const viewStartMs = dayjs(viewStart).valueOf();
  const viewEndMs = dayjs(viewEnd).valueOf();
  const span = viewEndMs - viewStartMs;
  if (span <= 0) {
    return [];
  }
  const pxPerHour = trackWidth > 0 ? (trackWidth * HOUR_MS) / span : 0;
  const labelEvery = trackWidth > 0 ? pickLabelEvery(pxPerHour, minLabelPx) : span / HOUR_MS <= 6 ? 1 : 3;
  const tickMinutes = trackWidth > 0 ? pickTickMinutes(pxPerHour, labelEvery) : 60;
  const tickMs = tickMinutes * MINUTE_MS;
  const rangeStartMs = rangeStart ? dayjs(rangeStart).valueOf() : -Infinity;
  const rangeEndMs = rangeEnd ? dayjs(rangeEnd).valueOf() : Infinity;
  const ticks = [];
  let cursorMs = snapMs(viewStartMs, tickMs, 'ceil');
  while (cursorMs <= viewEndMs) {
    const cursor = dayjs(cursorMs);
    const major = cursor.minute() === 0;
    const midnight = major && cursor.hour() === 0;
    const minute = cursor.minute();
    const level = midnight ? 'day' : major ? 'hour' : minute === 30 ? 'half' : minute % 15 === 0 && tickMinutes < 15 ? 'quarter' : 'minute';
    ticks.push({
      key: cursorMs,
      ratio: (cursorMs - viewStartMs) / span,
      major,
      level,
      label: midnight ? cursor.format('MM-DD') : cursor.format('HH:mm'),
      showLabel: major && cursor.hour() % labelEvery === 0,
      outOfRange: cursorMs < rangeStartMs || cursorMs > rangeEndMs
    });
    cursorMs = snapMs(cursorMs + tickMs, tickMs);
  }
  return ticks;
};

export const formatDurationParts = minutes => {
  const total = Math.max(Math.round(minutes), 0);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
};

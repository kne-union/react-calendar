import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { classNames } from '../../utils';
import {
  DEFAULT_DEBOUNCE_WAIT,
  DEFAULT_DURATION,
  DEFAULT_FORMAT,
  DEFAULT_SEPARATOR,
  buildScaleTicks,
  consumeWheelSteps,
  createTimeWindow,
  estimateVelocity,
  formatDurationParts,
  formatTimeWindow,
  formatTimeWindowParts,
  getViewport,
  parseDateLike,
  resizeTimeWindow,
  resolveInertia,
  resolveVisibleSpan,
  timeAtClientX,
  toWindowValue,
  wheelDeltaToPx
} from '../../timeWindow';
import style from './style.module.scss';

const GRIP_MIN_WIDTH = 28;
const CLICK_MOVE_TOLERANCE = 4;
const DISCRETE_WHEEL_DELTA = 50;
const VISUAL_EASE_MS = 70;
const WHEEL_IDLE_MS = 140;
const WHEEL_NOTCH_EASE_MS = 90;
const WHEEL_INERTIA_SCALE = 0.6;

const sameInstant = (left, right) => {
  const leftDate = parseDateLike(left);
  const rightDate = parseDateLike(right);
  if (!leftDate || !rightDate) {
    return false;
  }
  return Math.abs(leftDate.valueOf() - rightDate.valueOf()) < 1000;
};

const readWindowStart = value => {
  if (!Array.isArray(value)) {
    return null;
  }
  return parseDateLike(value[0]);
};

const isDiscreteWheel = (event, deltaPx) => {
  if (event.deltaMode !== 0) {
    return true;
  }
  const legacy = event.wheelDeltaY || event.wheelDeltaX;
  if (legacy && Math.abs(legacy) % 120 === 0) {
    return true;
  }
  return Math.abs(deltaPx) >= DISCRETE_WHEEL_DELTA;
};

const useElementWidth = ref => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    setWidth(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};

const TimeWindowInner = ({
  value,
  defaultValue,
  onChange,
  duration,
  range,
  step,
  visibleSpan,
  debounceWait = DEFAULT_DEBOUNCE_WAIT,
  format = DEFAULT_FORMAT,
  separator = DEFAULT_SEPARATOR,
  showDuration = true,
  size = 'default',
  inertia = true,
  resizable = true,
  wheelEffect = true,
  lockable = false,
  locked,
  defaultLocked = false,
  onLockedChange,
  minDuration,
  maxDuration,
  className,
  style: styleProp
}) => {
  const { formatMessage } = useIntl();
  const isControlled = typeof value !== 'undefined';
  const [innerValue, setInnerValue] = useState(() => {
    if (Array.isArray(defaultValue) && readWindowStart(defaultValue)) {
      return defaultValue;
    }
    return toWindowValue(createTimeWindow({ duration, range, step }));
  });
  const [draftStart, setDraftStart] = useState(null);
  const [draftDuration, setDraftDuration] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [innerLocked, setInnerLocked] = useState(defaultLocked);
  const lockedControlled = typeof locked === 'boolean';
  const isLocked = lockable && (lockedControlled ? locked : innerLocked);
  const [resizeView, setResizeView] = useState(null);
  const resizeRef = useRef(null);
  const resizeEdge = resizeView ? resizeView.edge : null;
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const interactingRef = useRef(false);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onLockedChangeRef = useRef(onLockedChange);
  const isLockedRef = useRef(isLocked);
  onLockedChangeRef.current = onLockedChange;
  isLockedRef.current = isLocked;
  const trackWidth = useElementWidth(trackRef);

  const committedValue = isControlled ? value : innerValue;
  const committedStart = readWindowStart(committedValue);
  const committedMs = committedStart ? committedStart.valueOf() : null;
  const anchorDay = committedStart ? committedStart.startOf('day').valueOf() : undefined;
  const draftMs = draftStart ? draftStart.valueOf() : null;
  const committedEnd = Array.isArray(committedValue) ? parseDateLike(committedValue[1]) : null;
  const committedEndMs = committedEnd ? committedEnd.valueOf() : null;
  const committedDuration = committedStart && committedEnd && committedEnd.isAfter(committedStart) ? committedEnd.diff(committedStart, 'minute', true) : null;
  const activeDuration = draftDuration != null ? draftDuration : committedDuration != null ? committedDuration : duration;

  const initialDurationRef = useRef(committedDuration || DEFAULT_DURATION);
  const optionsRef = useRef(null);
  onChangeRef.current = onChange;
  optionsRef.current = { duration: activeDuration, range, step, now: anchorDay };

  const baseWindow = useMemo(() => {
    const start = draftMs == null ? committedMs : draftMs;
    return createTimeWindow({ start, duration: activeDuration, range, step, now: anchorDay });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDay, committedMs, draftMs, activeDuration, step, JSON.stringify(range === undefined ? 'default' : range)]);

  const visibleSpanMinutes = resolveVisibleSpan({
    visibleSpan,
    duration: baseWindow.duration,
    baseDuration: Number(duration) > 0 ? Number(duration) : initialDurationRef.current,
    rangeStart: baseWindow.rangeStart,
    rangeEnd: baseWindow.rangeEnd
  });
  const baseStartMs = baseWindow.start.valueOf();
  const rangeStartMs = baseWindow.rangeStart ? baseWindow.rangeStart.valueOf() : null;
  const rangeEndMs = baseWindow.rangeEnd ? baseWindow.rangeEnd.valueOf() : null;
  const durationMs = baseWindow.duration * 60 * 1000;

  const [visualMs, setVisualMs] = useState(null);
  const visualRef = useRef(null);
  const visualTargetRef = useRef(null);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(0);
  const wheelActiveRef = useRef(false);
  const wheelIdleRef = useRef(null);
  const easeRef = useRef(VISUAL_EASE_MS);
  const glidingRef = useRef(false);
  const wheelBaseRef = useRef(null);
  const wheelSamplesRef = useRef([]);
  const wheelDirectionRef = useRef(0);
  const inertiaTau = resolveInertia(inertia);
  const inertiaRef = useRef(inertiaTau);
  inertiaRef.current = inertiaTau;

  const clampVisual = ms => {
    let next = ms;
    if (rangeEndMs != null) {
      next = Math.min(next, rangeEndMs - durationMs);
    }
    if (rangeStartMs != null) {
      next = Math.max(next, rangeStartMs);
    }
    return next;
  };
  const clampVisualRef = useRef(clampVisual);
  clampVisualRef.current = clampVisual;

  const runFrame = time => {
    const target = visualTargetRef.current;
    const current = visualRef.current == null ? target : visualRef.current;
    const dt = lastFrameRef.current ? Math.min(time - lastFrameRef.current, 64) : 16;
    lastFrameRef.current = time;
    const diff = target - current;
    const settled = Math.abs(diff) < 1000;
    const next = settled ? target : current + diff * (1 - Math.exp(-dt / easeRef.current));
    visualRef.current = next;
    setVisualMs(next);
    if (glidingRef.current) {
      moveToRef.current(next);
    }
    if (settled) {
      frameRef.current = null;
      lastFrameRef.current = 0;
      easeRef.current = VISUAL_EASE_MS;
      glidingRef.current = false;
      return;
    }
    frameRef.current = requestAnimationFrame(runFrame);
  };

  const stopGlide = () => {
    if (!glidingRef.current) {
      return false;
    }
    glidingRef.current = false;
    wheelBaseRef.current = null;
    wheelSamplesRef.current = [];
    wheelDirectionRef.current = 0;
    easeRef.current = VISUAL_EASE_MS;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameRef.current = 0;
    }
    visualTargetRef.current = visualRef.current;
    return true;
  };

  const glideTo = (ms, easeMs = inertiaTau) => {
    const snapped = createTimeWindow({ start: ms, ...optionsRef.current }).start.valueOf();
    glidingRef.current = true;
    easeRef.current = easeMs;
    setVisualTarget(snapped);
  };

  const setVisualTarget = (ms, { immediate = false } = {}) => {
    const target = clampVisualRef.current(ms);
    visualTargetRef.current = target;
    if (immediate || typeof requestAnimationFrame === 'undefined') {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        lastFrameRef.current = 0;
      }
      visualRef.current = target;
      setVisualMs(target);
      return;
    }
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(runFrame);
    }
  };
  const setVisualTargetRef = useRef(setVisualTarget);
  setVisualTargetRef.current = setVisualTarget;
  const glideToRef = useRef(glideTo);
  glideToRef.current = glideTo;
  const stopGlideRef = useRef(stopGlide);
  stopGlideRef.current = stopGlide;

  useEffect(
    () => () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      clearTimeout(wheelIdleRef.current);
    },
    []
  );

  useEffect(() => {
    if (dragRef.current || resizeRef.current || wheelActiveRef.current || glidingRef.current) {
      return;
    }
    if (visualRef.current == null) {
      visualRef.current = baseStartMs;
      visualTargetRef.current = baseStartMs;
      return;
    }
    setVisualTargetRef.current(baseStartMs);
  }, [baseStartMs]);

  const displayStartMs = resizeView || visualMs == null ? baseStartMs : visualMs;
  const viewport = resizeView || getViewport({ startMs: displayStartMs, duration: baseWindow.duration }, visibleSpanMinutes);

  const viewRef = useRef(null);
  const baseWindowRef = useRef(baseWindow);
  baseWindowRef.current = baseWindow;
  viewRef.current = viewport;

  const ticks = useMemo(
    () =>
      buildScaleTicks(viewport.startMs, viewport.endMs, {
        trackWidth,
        rangeStart: rangeStartMs,
        rangeEnd: rangeEndMs
      }),
    [viewport.startMs, viewport.endMs, trackWidth, rangeStartMs, rangeEndMs]
  );

  const toPercent = ms => ((ms - viewport.startMs) / viewport.spanMs) * 100;
  const width = (durationMs / viewport.spanMs) * 100;
  const left = toPercent(displayStartMs);
  const windowPx = (width / 100) * trackWidth;
  const leftShade = rangeStartMs != null ? Math.min(Math.max(toPercent(rangeStartMs), 0), 100) : 0;
  const rightShade = rangeEndMs != null ? Math.min(Math.max(100 - toPercent(rangeEndMs), 0), 100) : 0;

  const label = useMemo(() => {
    if (typeof format === 'function') {
      return format(baseWindow.start.toDate(), baseWindow.end.toDate());
    }
    const [startText, endText] = formatTimeWindowParts({ start: baseWindow.start, end: baseWindow.end, format });
    return (
      <>
        <span>{startText}</span>
        <span className={style.separator}>{separator}</span>
        <span>{endText}</span>
      </>
    );
  }, [baseWindow.end, baseWindow.start, format, separator]);

  const ariaValueText = formatTimeWindow({
    start: baseWindow.start,
    end: baseWindow.end,
    format: typeof format === 'function' ? DEFAULT_FORMAT : format,
    separator: typeof separator === 'string' ? separator : DEFAULT_SEPARATOR
  });

  const durationText = useMemo(() => {
    const { hours, minutes } = formatDurationParts(baseWindow.duration);
    const parts = [];
    if (hours) {
      parts.push(formatMessage({ id: 'TimeWindow.hours' }, { count: hours }));
    }
    if (minutes || !hours) {
      parts.push(formatMessage({ id: 'TimeWindow.minutes' }, { count: minutes }));
    }
    return parts.join(' ');
  }, [baseWindow.duration, formatMessage]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (interactingRef.current || draftMs == null) {
      return;
    }
    const pending = Array.isArray(pendingRef.current) ? pendingRef.current : null;
    if (pending && sameInstant(committedMs, pending[0]) && sameInstant(committedEndMs, pending[1])) {
      pendingRef.current = null;
      setDraftStart(null);
      setDraftDuration(null);
    }
  }, [committedMs, committedEndMs, draftMs]);

  const publish = nextWindow => {
    const nextValue = toWindowValue(nextWindow);
    baseWindowRef.current = nextWindow;
    pendingRef.current = nextValue;
    setDraftStart(nextWindow.start);
    setDraftDuration(nextWindow.duration);
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!isControlled) {
        setInnerValue(nextValue);
      }
      if (onChangeRef.current) {
        onChangeRef.current(nextValue);
      }
    }, debounceWait);
  };

  const moveTo = startInput => {
    const current = baseWindowRef.current;
    const nextWindow = createTimeWindow({
      start: startInput,
      ...optionsRef.current
    });
    if (nextWindow.start.valueOf() === current.start.valueOf()) {
      return;
    }
    publish(nextWindow);
  };
  const moveToRef = useRef(moveTo);
  moveToRef.current = moveTo;

  const durationPropRef = useRef(duration);
  useEffect(() => {
    if (durationPropRef.current === duration) {
      return;
    }
    durationPropRef.current = duration;
    publish(createTimeWindow({ ...optionsRef.current, start: baseWindowRef.current.start, duration }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const pointerTimeAt = (clientX, view) => {
    const rect = trackRef.current ? trackRef.current.getBoundingClientRect() : { left: 0, width: 1 };
    return timeAtClientX({
      clientX,
      rectLeft: rect.left,
      rectWidth: rect.width,
      rangeStartMs: view.startMs,
      rangeEndMs: view.endMs
    });
  };

  const startResize = (event, edge) => {
    const view = viewRef.current;
    const current = baseWindowRef.current;
    const edgeMs = edge === 'start' ? current.start.valueOf() : current.end.valueOf();
    resizeRef.current = {
      pointerId: event.pointerId,
      edge,
      view,
      grabOffsetMs: pointerTimeAt(event.clientX, view) - edgeMs
    };
    interactingRef.current = true;
    setResizeView({ ...view, edge });
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      // pointer may already be released
    }
  };

  const moveResize = event => {
    const resize = resizeRef.current;
    const current = baseWindowRef.current;
    const next = resizeTimeWindow({
      edge: resize.edge,
      pointerMs: pointerTimeAt(event.clientX, resize.view) - resize.grabOffsetMs,
      startMs: current.start.valueOf(),
      endMs: current.end.valueOf(),
      step: current.step,
      rangeStart: current.rangeStart,
      rangeEnd: current.rangeEnd,
      minDuration,
      maxDuration
    });
    if (next.startMs === current.start.valueOf() && next.duration === current.duration) {
      return;
    }
    publish(createTimeWindow({ ...optionsRef.current, start: next.startMs, duration: next.duration }));
  };

  const endResize = () => {
    const resize = resizeRef.current;
    resizeRef.current = null;
    interactingRef.current = false;
    const current = baseWindowRef.current;
    const centerMs = resize.view.startMs + resize.view.spanMs / 2;
    const frozenStart = centerMs - (current.duration * 60 * 1000) / 2;
    visualRef.current = frozenStart;
    setVisualMs(frozenStart);
    setResizeView(null);
    setVisualTargetRef.current(current.start.valueOf());
  };

  const onPointerDown = event => {
    if (event.button != null && event.button !== 0) {
      return;
    }
    const braked = stopGlideRef.current();
    const edgeNode = resizable && event.target && event.target.closest ? event.target.closest('[data-edge]') : null;
    if (edgeNode) {
      startResize(event, edgeNode.getAttribute('data-edge'));
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      originMs: visualRef.current == null ? baseWindowRef.current.start.valueOf() : visualRef.current,
      moved: false,
      braked,
      samples: []
    };
    interactingRef.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      // pointer may already be released
    }
  };

  const onPointerMove = event => {
    if (resizeRef.current) {
      if (resizeRef.current.pointerId === event.pointerId) {
        moveResize(event);
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < CLICK_MOVE_TOLERANCE) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
    }
    const rect = trackRef.current ? trackRef.current.getBoundingClientRect() : { width: 1 };
    const deltaMs = (dx / (rect.width || 1)) * viewRef.current.spanMs;
    const rawMs = drag.originMs - deltaMs;
    drag.samples.push({ t: event.timeStamp, ms: rawMs });
    if (drag.samples.length > 12) {
      drag.samples.shift();
    }
    moveToRef.current(rawMs);
    setVisualTargetRef.current(rawMs, { immediate: true });
  };

  const endDrag = event => {
    if (resizeRef.current) {
      if (!event || resizeRef.current.pointerId === event.pointerId) {
        endResize();
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || (event && drag.pointerId !== event.pointerId)) {
      return;
    }
    dragRef.current = null;
    interactingRef.current = false;
    setDragging(false);
    if (drag.moved) {
      const velocity = inertiaRef.current && event ? estimateVelocity(drag.samples, event.timeStamp) : 0;
      const projection = velocity * inertiaRef.current;
      if (Math.abs(projection) >= baseWindowRef.current.step * 60 * 1000) {
        glideToRef.current(visualRef.current + projection);
      } else {
        setVisualTargetRef.current(baseWindowRef.current.start.valueOf());
      }
    }
    if (!drag.moved && drag.braked) {
      moveToRef.current(drag.originMs);
      setVisualTargetRef.current(baseWindowRef.current.start.valueOf());
      return;
    }
    if (!drag.moved && event && event.type === 'pointerup') {
      const rect = trackRef.current ? trackRef.current.getBoundingClientRect() : { left: 0, width: 1 };
      const view = viewRef.current;
      const clickedMs = timeAtClientX({
        clientX: event.clientX,
        rectLeft: rect.left,
        rectWidth: rect.width,
        rangeStartMs: view.startMs,
        rangeEndMs: view.endMs
      });
      const current = baseWindowRef.current;
      moveToRef.current(clickedMs - (current.duration * 60 * 1000) / 2);
    }
  };

  const onKeyDown = event => {
    stopGlideRef.current();
    const current = baseWindowRef.current;
    const stepMinutes = current.step;
    const moves = {
      ArrowLeft: -stepMinutes,
      ArrowDown: -stepMinutes,
      ArrowRight: stepMinutes,
      ArrowUp: stepMinutes,
      PageDown: -current.duration,
      PageUp: current.duration
    };
    if (event.key === 'Home' && current.rangeStart) {
      event.preventDefault();
      moveToRef.current(current.rangeStart);
      return;
    }
    if (event.key === 'End' && current.rangeEnd) {
      event.preventDefault();
      moveToRef.current(current.rangeEnd);
      return;
    }
    if (!(event.key in moves)) {
      return;
    }
    event.preventDefault();
    const minutes = event.shiftKey ? Math.sign(moves[event.key]) * Math.max(60, stepMinutes) : moves[event.key];
    moveToRef.current(current.start.add(minutes, 'minute'));
  };

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return undefined;
    }
    const onWheel = event => {
      if (isLockedRef.current) {
        return;
      }
      const dominant = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!dominant) {
        return;
      }
      event.preventDefault();
      const current = baseWindowRef.current;
      const rectWidth = trackRef.current ? trackRef.current.getBoundingClientRect().width : node.clientWidth;
      const deltaPx = wheelDeltaToPx({ delta: dominant, deltaMode: event.deltaMode, trackWidth: rectWidth });
      const stepMs = current.step * 60 * 1000;
      const pxPerStep = (rectWidth * stepMs) / viewRef.current.spanMs;
      const discrete = isDiscreteWheel(event, deltaPx);
      const { steps, accumulatedPx } = consumeWheelSteps({
        accumulatedPx: wheelAccumRef.current,
        deltaPx,
        pxPerStep,
        discrete
      });
      wheelAccumRef.current = accumulatedPx;
      wheelActiveRef.current = true;
      clearTimeout(wheelIdleRef.current);
      wheelIdleRef.current = setTimeout(() => {
        wheelActiveRef.current = false;
        wheelAccumRef.current = 0;
        wheelBaseRef.current = null;
        wheelSamplesRef.current = [];
        wheelDirectionRef.current = 0;
        if (!glidingRef.current) {
          setVisualTargetRef.current(baseWindowRef.current.start.valueOf());
        }
      }, WHEEL_IDLE_MS);

      if (discrete && inertiaRef.current) {
        if (!steps) {
          return;
        }
        const samples = wheelSamplesRef.current;
        if (wheelDirectionRef.current !== Math.sign(steps)) {
          samples.length = 0;
          wheelBaseRef.current = null;
          wheelDirectionRef.current = Math.sign(steps);
        }
        const from = wheelBaseRef.current == null ? current.start.valueOf() : wheelBaseRef.current;
        const base = createTimeWindow({ start: from + steps * stepMs, ...optionsRef.current }).start.valueOf();
        wheelBaseRef.current = base;
        samples.push({ t: event.timeStamp, ms: base });
        if (samples.length > 8) {
          samples.shift();
        }
        const projection = estimateVelocity(samples, event.timeStamp) * inertiaRef.current * WHEEL_INERTIA_SCALE;
        let target = base + projection;
        const lastTarget = visualTargetRef.current;
        if (samples.length > 1 && lastTarget != null && (target - lastTarget) * wheelDirectionRef.current < 0) {
          target = lastTarget;
        }
        glideToRef.current(target, projection ? inertiaRef.current : WHEEL_NOTCH_EASE_MS);
        return;
      }

      if (steps) {
        moveToRef.current(current.start.valueOf() + steps * stepMs);
      }
      const residualMs = pxPerStep > 0 ? (accumulatedPx / pxPerStep) * stepMs : 0;
      setVisualTargetRef.current(baseWindowRef.current.start.valueOf() + residualMs);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  const toggleLocked = () => {
    const next = !isLockedRef.current;
    if (next) {
      stopGlideRef.current();
    }
    if (!lockedControlled) {
      setInnerLocked(next);
    }
    if (onLockedChangeRef.current) {
      onLockedChangeRef.current(next);
    }
  };

  const labelTicks = ticks.filter(tick => tick.showLabel);
  const ariaBounds = {};
  if (rangeStartMs != null) {
    ariaBounds['aria-valuemin'] = rangeStartMs;
  }
  if (rangeEndMs != null) {
    ariaBounds['aria-valuemax'] = rangeEndMs - durationMs;
  }

  return (
    <div
      ref={rootRef}
      className={classNames(style.root, style[`root-${size}`], className, {
        [style['root-dragging']]: dragging,
        [style['root-resizing']]: !!resizeView,
        [style['root-locked']]: isLocked
      })}
      style={styleProp}
    >
      <div className={style.header}>
        <div className={style.label}>{label}</div>
        <div className={style.actions}>
          {lockable ? (
            <button
              type="button"
              role="switch"
              aria-checked={!isLocked}
              aria-label={formatMessage({ id: isLocked ? 'TimeWindow.locked' : 'TimeWindow.editable' })}
              className={classNames(style.switch, { [style['switch-on']]: !isLocked })}
              onClick={toggleLocked}
            >
              <i />
            </button>
          ) : null}
          {showDuration ? <span className={style.duration}>{durationText}</span> : null}
        </div>
      </div>
      {isLocked ? null : (
        <div className={style.scale}>
          <div
            ref={trackRef}
            className={classNames(style.track, { [style['track-wheel']]: wheelEffect })}
            role="slider"
            tabIndex={0}
            {...ariaBounds}
            aria-valuenow={baseWindow.start.valueOf()}
            aria-valuetext={ariaValueText}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {leftShade > 0 ? <span className={classNames(style.shade, style['shade-start'])} style={{ width: `${leftShade}%` }} /> : null}
            {rightShade > 0 ? <span className={classNames(style.shade, style['shade-end'])} style={{ width: `${rightShade}%` }} /> : null}
            <div className={style.ticks}>
              {ticks.map(tick => (
                <span
                  key={tick.key}
                  className={classNames(style.tick, style[`tick-${tick.level}`], {
                    [style['tick-out']]: tick.outOfRange
                  })}
                  style={{ left: `${tick.ratio * 100}%` }}
                />
              ))}
            </div>
            {wheelEffect ? <span className={style.cylinder} aria-hidden="true" /> : null}
            <span
              className={classNames(style.window, {
                [style['window-compact']]: windowPx < GRIP_MIN_WIDTH,
                [style['window-resizable']]: resizable,
                [style['window-fixed']]: !resizable
              })}
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              {resizable ? (
                <>
                  <span data-edge="start" aria-hidden="true" className={classNames(style.edge, style['edge-start'], { [style['edge-active']]: resizeEdge === 'start' })} />
                  <span data-edge="end" aria-hidden="true" className={classNames(style.edge, style['edge-end'], { [style['edge-active']]: resizeEdge === 'end' })} />
                </>
              ) : null}
            </span>
          </div>
          <div className={style.labels}>
            {labelTicks.map(tick => (
              <span
                key={tick.key}
                className={classNames(style['tick-label'], style[`tick-label-${tick.level}`], {
                  [style['tick-out']]: tick.outOfRange
                })}
                style={{ left: `${tick.ratio * 100}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TimeWindow = withLocale(TimeWindowInner);

export default TimeWindow;

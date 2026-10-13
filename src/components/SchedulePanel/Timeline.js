import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Popover, Tooltip } from 'antd';
import { TIME_FORMAT } from '../../constants';
import { MINUTE_MS, clickSelectionRange, createSelectionRange, getFreeGap, moveSelectionRange, resizeSelectionRange, snapToStep } from '../../timeline';
import { classNames, formatRange } from '../../utils';
import EventDetail from './EventDetail';
import style from './style.module.scss';

const DRAG_THRESHOLD_PX = 4;
const TOUCH_SLOP_PX = 8;
const LONG_PRESS_MS = 350;

const Timeline = ({
  date,
  day,
  hourHeight,
  timeUnit,
  timeStep,
  eventItems,
  disabledRanges,
  blockers,
  conflicts,
  allowMultiSelect,
  selection,
  dragging,
  formPopover,
  popoverOpen,
  popoverPlacement,
  popoverAnchor,
  onPopoverOpenChange,
  onSelectionDrag,
  onSelectionCommit,
  onFreeSlotClick,
  onEventClick,
  renderEventBlock,
  renderOccupiedSlot,
  interactionRef,
  isMobile
}) => {
  const gridRef = useRef(null);
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const touchCommitRef = useRef(0);
  const [hover, setHover] = useState(null);
  const [activeEventKey, setActiveEventKey] = useState(null);
  const pxPerMs = hourHeight / (60 * MINUTE_MS);
  const height = (day.endMs - day.startMs) * pxPerMs;
  const unitMs = timeUnit * MINUTE_MS;
  const stepMs = timeStep * MINUTE_MS;

  const latest = useRef({});
  latest.current = { day, blockers, unitMs, stepMs, allowMultiSelect, selection, onSelectionDrag, onSelectionCommit, onFreeSlotClick, pxPerMs };

  const toY = ms => (ms - day.startMs) * pxPerMs;

  const lines = useMemo(() => {
    const list = [];
    for (let ms = day.startMs; ms <= day.endMs; ms += unitMs) {
      list.push({ ms, hour: dayjs(ms).minute() === 0 });
    }
    return list;
  }, [day.endMs, day.startMs, unitMs]);

  const labels = useMemo(() => {
    const list = [];
    let cursor = dayjs(day.startMs);
    if (cursor.minute() !== 0) {
      list.push(day.startMs);
      cursor = cursor.add(1, 'hour').startOf('hour');
    }
    for (; cursor.valueOf() <= day.endMs; cursor = cursor.add(1, 'hour')) {
      list.push(cursor.valueOf());
    }
    if (list[list.length - 1] !== day.endMs) {
      list.push(day.endMs);
    }
    return list;
  }, [day.endMs, day.startMs]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const showNow = now >= day.startMs && now <= day.endMs;

  const msAtClientY = clientY => {
    const rect = gridRef.current.getBoundingClientRect();
    const { day: currentDay, pxPerMs: currentPx } = latest.current;
    return Math.min(Math.max(currentDay.startMs + (clientY - rect.top) / currentPx, currentDay.startMs), currentDay.endMs - 1);
  };

  const finishGesture = () => {
    const gesture = gestureRef.current;
    if (!gesture) {
      return;
    }
    clearTimeout(gesture.timer);
    window.removeEventListener('pointermove', gesture.onMove);
    window.removeEventListener('pointerup', gesture.onUp);
    window.removeEventListener('pointercancel', gesture.onCancel);
    gestureRef.current = null;
  };

  useEffect(() => finishGesture, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return undefined;
    }
    const preventScroll = event => {
      if (gestureRef.current?.active) {
        event.preventDefault();
      }
    };
    const preventGhostClick = event => {
      if (Date.now() - touchCommitRef.current < 300) {
        event.preventDefault();
      }
    };
    grid.addEventListener('touchmove', preventScroll, { passive: false });
    grid.addEventListener('touchend', preventGhostClick, { passive: false });
    return () => {
      grid.removeEventListener('touchmove', preventScroll);
      grid.removeEventListener('touchend', preventGhostClick);
    };
  }, []);

  const handlePointerDown = event => {
    if (!gridRef.current?.contains(event.target)) {
      return;
    }
    if (interactionRef) {
      interactionRef.current = Date.now();
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const { day: currentDay, blockers: currentBlockers, selection: currentSelection, allowMultiSelect: multi } = latest.current;
    const edgeNode = event.target.closest('[data-selection-edge]');
    const onSelection = event.target.closest('[data-timeline-selection]');
    const eventNode = event.target.closest('[data-timeline-event]');
    const pointerMs = msAtClientY(event.clientY);
    let gesture;
    if (edgeNode && currentSelection && multi) {
      gesture = { type: 'resize', edge: edgeNode.dataset.selectionEdge, active: true };
    } else if (onSelection && currentSelection) {
      gesture = { type: 'move', active: true };
    } else {
      const gap = getFreeGap(pointerMs, currentBlockers, currentDay);
      if (!gap) {
        return;
      }
      gesture = { type: 'create', gap, active: event.pointerType === 'mouse', onEvent: !!eventNode };
    }
    if (gesture.type !== 'create') {
      const ownGap = getFreeGap(currentSelection.startMs, currentBlockers, currentDay) || currentDay;
      gesture.gap = ownGap;
      gesture.range0 = currentSelection;
      event.preventDefault();
    }
    Object.assign(gesture, {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      startMs: pointerMs,
      moved: false
    });
    setHover(null);

    gesture.onMove = moveEvent => {
      if (moveEvent.pointerId !== gesture.pointerId) {
        return;
      }
      const dx = moveEvent.clientX - gesture.startX;
      const dy = moveEvent.clientY - gesture.startY;
      if (!gesture.active) {
        if (Math.hypot(dx, dy) > TOUCH_SLOP_PX) {
          finishGesture();
        }
        return;
      }
      if (!gesture.moved && Math.abs(dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      const { stepMs: step, day: d, allowMultiSelect: canResize } = latest.current;
      const ms = msAtClientY(moveEvent.clientY);
      let next;
      if (gesture.type === 'create') {
        if (!canResize) {
          return;
        }
        next = createSelectionRange({ anchorMs: gesture.startMs, pointerMs: ms, gap: gesture.gap, originMs: d.startMs, stepMs: step });
      } else if (gesture.type === 'move') {
        next = moveSelectionRange({ range: gesture.range0, deltaMs: ms - gesture.startMs, gap: gesture.gap, originMs: d.startMs, stepMs: step });
      } else {
        next = resizeSelectionRange({ range: gesture.range0, edge: gesture.edge, pointerMs: ms, gap: gesture.gap, originMs: d.startMs, stepMs: step });
      }
      gesture.moved = true;
      gesture.range = next;
      latest.current.onSelectionDrag(next);
    };

    gesture.onUp = upEvent => {
      if (upEvent.pointerId !== gesture.pointerId) {
        return;
      }
      finishGesture();
      if (gesture.pointerType !== 'mouse') {
        touchCommitRef.current = Date.now();
      }
      const { unitMs: unit, day: d, onSelectionCommit: commit, onFreeSlotClick: onFreeClick } = latest.current;
      if (gesture.moved) {
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
        commit(gesture.range);
        return;
      }
      if (gesture.type !== 'create') {
        commit(gesture.range0);
        return;
      }
      if (gesture.onEvent) {
        return;
      }
      const range = clickSelectionRange({ pointerMs: gesture.startMs, gap: gesture.gap, originMs: d.startMs, unitMs: unit });
      const slotStart = snapToStep(gesture.startMs, { originMs: d.startMs, stepMs: unit, mode: 'floor' });
      onFreeClick?.({ start: new Date(slotStart), end: new Date(Math.min(slotStart + unit, d.endMs)) });
      commit(range);
    };

    gesture.onCancel = cancelEvent => {
      if (cancelEvent.pointerId !== gesture.pointerId) {
        return;
      }
      const wasMoved = gesture.moved;
      finishGesture();
      if (wasMoved) {
        latest.current.onSelectionCommit(gesture.range);
      }
    };

    if (!gesture.active) {
      gesture.timer = setTimeout(() => {
        gesture.active = true;
        navigator.vibrate?.(10);
        const { day: d, unitMs: unit } = latest.current;
        const range = clickSelectionRange({ pointerMs: gesture.startMs, gap: gesture.gap, originMs: d.startMs, unitMs: unit });
        gesture.moved = true;
        gesture.range = range;
        gesture.startMs = range.startMs;
        latest.current.onSelectionDrag(range);
      }, LONG_PRESS_MS);
    }

    finishGesture();
    gestureRef.current = gesture;
    window.addEventListener('pointermove', gesture.onMove);
    window.addEventListener('pointerup', gesture.onUp);
    window.addEventListener('pointercancel', gesture.onCancel);
  };

  const handleHover = event => {
    if (event.pointerType !== 'mouse' || gestureRef.current || !gridRef.current?.contains(event.target)) {
      return;
    }
    if (event.target.closest('[data-timeline-selection]')) {
      setHover(null);
      return;
    }
    const ms = msAtClientY(event.clientY);
    const gap = getFreeGap(ms, blockers, day);
    if (!gap) {
      setHover(null);
      return;
    }
    const range = clickSelectionRange({ pointerMs: ms, gap, originMs: day.startMs, unitMs });
    setHover(current => (current && current.startMs === range.startMs && current.endMs === range.endMs ? current : range));
  };

  const renderEventContent = item => {
    const { event } = item;
    if (renderEventBlock) {
      return renderEventBlock(event, { start: new Date(item.startMs), end: new Date(item.endMs) });
    }
    if (renderOccupiedSlot) {
      return renderOccupiedSlot({ start: new Date(item.startMs), end: new Date(item.endMs), status: 'occupied', events: [event] }, { events: [event] });
    }
    return (
      <>
        <div className={style['timeline-event-title']}>{event.title}</div>
        <div className={style['timeline-event-time']}>{formatRange(event.start, event.end)}</div>
      </>
    );
  };

  const selectionBlock = selection ? (
    <div
      data-timeline-selection=""
      className={classNames(style['timeline-selection'], {
        [style['timeline-selection-dragging']]: dragging,
        [style['timeline-selection-conflict']]: conflicts.length > 0,
        [style['timeline-selection-compact']]: (selection.endMs - selection.startMs) * pxPerMs < 34
      })}
      style={{ top: toY(selection.startMs), height: Math.max((selection.endMs - selection.startMs) * pxPerMs, 6) }}
    >
      {allowMultiSelect ? <span data-selection-edge="start" className={classNames(style['timeline-selection-edge'], style['timeline-selection-edge-start'])} /> : null}
      <div className={style['timeline-selection-label']}>
        <span>{formatRange(selection.startMs, selection.endMs)}</span>
        {conflicts.length ? <span className={style['timeline-selection-badge']}>{conflicts.length}</span> : null}
      </div>
      {allowMultiSelect ? <span data-selection-edge="end" className={classNames(style['timeline-selection-edge'], style['timeline-selection-edge-end'])} /> : null}
    </div>
  ) : null;

  return (
    <div className={style['timeline']} style={{ height }}>
      <div className={style['timeline-axis']} aria-hidden>
        {labels.map(ms => (
          <span key={ms} className={style['timeline-axis-label']} style={{ top: toY(ms) }}>
            {dayjs(ms).format(TIME_FORMAT)}
          </span>
        ))}
      </div>
      <div
        ref={gridRef}
        className={classNames(style['timeline-grid'], { [style['timeline-grid-dragging']]: dragging })}
        onPointerDown={handlePointerDown}
        onPointerMove={handleHover}
        onPointerLeave={() => setHover(null)}
        onContextMenu={event => {
          if (gridRef.current?.contains(event.target)) {
            event.preventDefault();
          }
        }}
        onClickCapture={event => {
          if (suppressClickRef.current && gridRef.current?.contains(event.target)) {
            suppressClickRef.current = false;
            event.stopPropagation();
          }
        }}
      >
        {lines.map(line => (
          <span key={line.ms} className={classNames(style['timeline-line'], { [style['timeline-line-hour']]: line.hour })} style={{ top: toY(line.ms) }} />
        ))}
        {disabledRanges.map(range => {
          const block = (
            <div key={range.startMs} className={style['timeline-disabled']} style={{ top: toY(range.startMs), height: (range.endMs - range.startMs) * pxPerMs }}>
              {range.reason && (range.endMs - range.startMs) * pxPerMs >= 22 ? <span className={style['timeline-disabled-reason']}>{range.reason}</span> : null}
            </div>
          );
          return range.reason ? (
            <Tooltip key={range.startMs} title={range.reason}>
              {block}
            </Tooltip>
          ) : (
            block
          );
        })}
        {eventItems.map(item => {
          const key = `${item.event.id}-${item.startMs}`;
          const blockHeight = (item.endMs - item.startMs) * pxPerMs;
          return (
            <Popover
              key={key}
              arrow={false}
              trigger="click"
              placement={isMobile ? 'bottom' : 'left'}
              rootClassName={style['schedule-popover']}
              open={activeEventKey === key}
              onOpenChange={open => setActiveEventKey(open ? key : null)}
              content={<EventDetail event={item.event} date={date} onEventClick={onEventClick} />}
            >
              <div
                data-timeline-event=""
                className={classNames(style['timeline-event'], {
                  [style['timeline-event-disabled']]: item.event.disabled,
                  [style['timeline-event-compact']]: blockHeight < 34
                })}
                style={{
                  top: toY(item.startMs),
                  height: Math.max(blockHeight - 2, 4),
                  left: `calc(${(item.column / item.columns) * 100}% + 2px)`,
                  width: `calc(${100 / item.columns}% - 4px)`,
                  ...(item.event.color ? { '--timeline-event-color': item.event.color } : null)
                }}
              >
                {renderEventContent(item)}
              </div>
            </Popover>
          );
        })}
        {hover && !selection ? (
          <div className={style['timeline-ghost']} style={{ top: toY(hover.startMs), height: (hover.endMs - hover.startMs) * pxPerMs }}>
            + {dayjs(hover.startMs).format(TIME_FORMAT)}
          </div>
        ) : null}
        {showNow ? <span className={style['timeline-now']} style={{ top: toY(now) }} /> : null}
        {selectionBlock}
        {formPopover && popoverAnchor ? (
          <Popover arrow={false} trigger="click" placement={popoverPlacement} rootClassName={style['schedule-popover']} open={popoverOpen && !dragging} onOpenChange={onPopoverOpenChange} content={formPopover} destroyOnHidden>
            <span aria-hidden className={style['timeline-popover-anchor']} style={{ top: toY(popoverAnchor.startMs), height: (popoverAnchor.endMs - popoverAnchor.startMs) * pxPerMs }} />
          </Popover>
        ) : null}
      </div>
    </div>
  );
};

export default Timeline;

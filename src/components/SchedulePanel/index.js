import { useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Drawer, Spin } from 'antd';
import { Form, SubmitButton } from '@kne/form-info';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import { DATE_FORMAT } from '../../constants';
import { findOverlappingEvents, findOverlappingSlots, getFreeGap, layoutTimelineEvents, mergeDisabledSlots, toBlockers } from '../../timeline';
import { classNames, getDefaultFormValues, parseDayTime, sortEventsByStart } from '../../utils';
import PanelTitle from '../Panel/PanelTitle';
import PanelScrollShadow from '../Panel/PanelScrollShadow';
import usePanelScrollShadow from '../Panel/usePanelScrollShadow';
import panelStyle from '../Panel/style.module.scss';
import TimeWindow from '../TimeWindow';
import DefaultFormInner from './DefaultFormInner';
import Timeline from './Timeline';
import style from './style.module.scss';

const SchedulePanel = ({
  date,
  slots,
  events: dayEvents,
  dayStart,
  dayEnd,
  timeUnit,
  timeStep,
  hourHeight,
  allowConflict,
  loading,
  allowMultiSelect,
  onSlotRangeChange,
  onFreeSlotClick,
  onCreate,
  formInner,
  formProps,
  defaultFormValues,
  renderEventBlock,
  renderOccupiedSlot,
  renderPanelHeader,
  onEventClick
}) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);
  const interactionRef = useRef(0);
  const openedAtRef = useRef(0);
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPlacement, setPopoverPlacement] = useState('left');
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const day = useMemo(() => ({ startMs: parseDayTime(date, dayStart).valueOf(), endMs: parseDayTime(date, dayEnd).valueOf() }), [date, dayEnd, dayStart]);
  const events = useMemo(() => sortEventsByStart(dayEvents || []), [dayEvents]);
  const eventItems = useMemo(() => layoutTimelineEvents(events, day), [day, events]);
  const disabledRanges = useMemo(() => mergeDisabledSlots(slots), [slots]);
  const blockers = useMemo(() => toBlockers(allowConflict ? disabledRanges : [...disabledRanges, ...eventItems]), [allowConflict, disabledRanges, eventItems]);
  const conflicts = useMemo(
    () =>
      findOverlappingEvents(
        selection,
        eventItems.map(item => item.event)
      ),
    [eventItems, selection]
  );
  const gap = (selection && getFreeGap(selection.startMs, blockers, day)) || day;
  const windowRange = useMemo(() => [new Date(gap.startMs), new Date(gap.endMs)], [gap.startMs, gap.endMs]);

  const panelHeader = renderPanelHeader?.({ date: date.toDate(), mode: 'schedule', events });
  const { scrolled, onScroll } = usePanelScrollShadow(date.format(DATE_FORMAT), scrollRef);

  const getFormContext = range => ({
    date: date.toDate(),
    start: range ? new Date(range.startMs) : null,
    end: range ? new Date(range.endMs) : null,
    slots: findOverlappingSlots(range, slots),
    conflicts: findOverlappingEvents(
      range,
      eventItems.map(item => item.event)
    )
  });

  const emitRange = range => {
    if (range) {
      onSlotRangeChange?.(findOverlappingSlots(range, slots), { action: 'select', start: new Date(range.startMs), end: new Date(range.endMs) });
    } else {
      onSlotRangeChange?.([], { action: 'clear' });
    }
  };

  const clearSelection = () => {
    setPopoverOpen(false);
    setPopoverAnchor(null);
    setDragging(false);
    if (selection) {
      setSelection(null);
      emitRange(null);
    }
  };

  const commitSelection = range => {
    setDragging(false);
    if (!range) {
      return;
    }
    if (!popoverOpen) {
      const stacked = !!scrollRef.current?.closest('[data-schedule-layout="stacked"]');
      setPopoverPlacement(stacked ? 'bottom' : 'left');
      setPopoverAnchor(range);
    }
    setSelection(range);
    openedAtRef.current = Date.now();
    setPopoverOpen(true);
    emitRange(range);
  };

  const formContext = getFormContext(selection);
  const formPopover = selection ? (
    <div className={classNames(style['form-popover'], { [style['form-sheet-content']]: isMobile })}>
      <div className={style['form-popover-title']}>{formatMessage({ id: 'SchedulePanel.newScheduleTitle' })}</div>
      <TimeWindow
        className={style['form-time-window']}
        size={isMobile ? 'default' : 'small'}
        value={[new Date(selection.startMs), new Date(selection.endMs)]}
        range={windowRange}
        step={timeStep}
        minDuration={timeStep}
        resizable={allowMultiSelect}
        debounceWait={120}
        format="HH:mm"
        separator=" - "
        onChange={value => {
          if (!value) {
            return;
          }
          const range = { startMs: value[0].getTime(), endMs: value[1].getTime() };
          setSelection(range);
          emitRange(range);
        }}
      />
      {conflicts.length ? (
        <Alert className={style['form-conflict']} type="warning" showIcon title={`${formatMessage({ id: 'SchedulePanel.conflict' }, { count: conflicts.length })}：${conflicts.map(event => event.title).join('、')}`} />
      ) : null}
      <Form
        {...formProps}
        {...(isMobile ? { size: 'large' } : null)}
        data={getDefaultFormValues(defaultFormValues, formContext)}
        onSubmit={async values => {
          try {
            await onCreate?.(values, getFormContext(selection));
            clearSelection();
          } catch {
            // Keep the form open when creation fails.
          }
        }}
      >
        {formInner || <DefaultFormInner />}
        <div className={style['form-actions']}>
          <Button onClick={clearSelection}>{formatMessage({ id: 'SchedulePanel.cancel' })}</Button>
          <SubmitButton>{formatMessage({ id: 'SchedulePanel.save' })}</SubmitButton>
        </div>
      </Form>
    </div>
  ) : null;

  return (
    <Card bordered={false} title={panelHeader || <PanelTitle date={date} subtitle={formatMessage({ id: 'SchedulePanel.selectFreeSlot' })} />} className={panelStyle['panel-card']}>
      <Spin spinning={!!loading} classNames={{ root: panelStyle['panel-spin'], container: panelStyle['panel-spin-container'] }}>
        <div ref={scrollRef} className={style['slots']} onScroll={onScroll}>
          <PanelScrollShadow visible={scrolled} />
          <Timeline
            date={date.toDate()}
            day={day}
            hourHeight={hourHeight}
            timeUnit={timeUnit}
            timeStep={timeStep}
            eventItems={eventItems}
            disabledRanges={disabledRanges}
            blockers={blockers}
            conflicts={conflicts}
            allowMultiSelect={allowMultiSelect}
            selection={selection}
            dragging={dragging}
            formPopover={isMobile ? null : formPopover}
            isMobile={isMobile}
            popoverOpen={popoverOpen}
            popoverPlacement={popoverPlacement}
            popoverAnchor={popoverAnchor}
            interactionRef={interactionRef}
            onPopoverOpenChange={open => {
              if (open) {
                setPopoverOpen(true);
                return;
              }
              if (Date.now() - interactionRef.current < 400) {
                return;
              }
              clearSelection();
            }}
            onSelectionDrag={range => {
              setDragging(true);
              setSelection(range);
            }}
            onSelectionCommit={commitSelection}
            onFreeSlotClick={slot => onFreeSlotClick?.({ ...slot, key: `${date.format(DATE_FORMAT)}-${slot.start.getTime()}`, date: date.format(DATE_FORMAT), status: 'free', events: [] })}
            onEventClick={onEventClick}
            renderEventBlock={renderEventBlock}
            renderOccupiedSlot={renderOccupiedSlot}
          />
        </div>
      </Spin>
      {isMobile ? (
        <Drawer
          placement="bottom"
          size="auto"
          closable={false}
          rootClassName={style['form-sheet']}
          open={!!selection && popoverOpen && !dragging}
          onClose={() => {
            if (Date.now() - openedAtRef.current < 500) {
              return;
            }
            clearSelection();
          }}
          destroyOnHidden
        >
          {formPopover}
        </Drawer>
      ) : null}
    </Card>
  );
};

export default SchedulePanel;

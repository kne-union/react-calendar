import { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useControlValue from '@kne/use-control-value';
import { Calendar } from 'antd';
import withLocale from './withLocale';
import { DATE_FORMAT, LAYOUT_STACK_BREAKPOINT } from './constants';
import useStackedPanelLayout from './useStackedPanelLayout';
import { groupEventsByDate, generateTimeSlots } from './events';
import { checkRule } from './rules';
import { classNames, toDayjs, useControlledState } from './utils';
import Header from './components/Header';
import useStackedLayout from './useStackedLayout';
import DateCell from './components/DateCell';
import ViewPanel from './components/Panel/ViewPanel';
import SchedulePanel from './components/SchedulePanel';
import style from './style.module.scss';

dayjs.extend(customParseFormat);

const buildMonthRuleCache = ({ currentDate, mode, disabledDate, disabledDateTime, availableDateTime }) => {
  const cache = new Map();
  const monthStart = currentDate.startOf('month');
  const monthEnd = currentDate.endOf('month');
  let cursor = monthStart;
  while (cursor.isBefore(monthEnd) || cursor.isSame(monthEnd, 'day')) {
    cache.set(
      cursor.format(DATE_FORMAT),
      checkRule({
        date: cursor,
        mode,
        disabledDate,
        disabledDateTime,
        availableDateTime
      })
    );
    cursor = cursor.add(1, 'day');
  }
  return cache;
};

const ScheduleCalendarInner = props => {
  const {
    mode = 'view',
    events = [],
    loading,
    disabledDate,
    disabledDateTime,
    availableDateTime,
    badgeMaxCount = 9,
    timeUnit = 30,
    dayStart = '09:00',
    dayEnd = '18:00',
    allowMultiSelect = mode === 'schedule',
    renderDateCell,
    renderEventItem,
    renderTimeSlot,
    renderOccupiedSlot,
    renderPanelHeader,
    formInner,
    formProps,
    defaultFormValues,
    onDateChange,
    onEventClick,
    onFreeSlotClick,
    onSlotRangeChange,
    onCreate,
    className,
    style: propsStyle,
    stackAt = LAYOUT_STACK_BREAKPOINT,
    calendarProps,
    panelProps
  } = props;
  const rootRef = useRef(null);
  const calendarRef = useRef(null);
  const stacked = useStackedLayout(rootRef, stackAt);
  const stackedLayoutStyle = useStackedPanelLayout(rootRef, calendarRef, stacked);
  const [value, setValue] = useControlValue(props);
  const selectedDate = useMemo(() => toDayjs(value) || dayjs(), [value]);
  const [current, setCurrent] = useControlledState({
    value: props.current,
    defaultValue: props.defaultCurrent || selectedDate,
    onChange: props.onCurrentChange
  });
  const currentDate = useMemo(() => toDayjs(current) || selectedDate, [current, selectedDate]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const eventGroup = useMemo(() => groupEventsByDate(events), [events]);
  const selectedEvents = useMemo(() => eventGroup[selectedDate.format(DATE_FORMAT)] || [], [eventGroup, selectedDate]);
  const ruleContext = useMemo(
    () => ({
      mode,
      disabledDate,
      disabledDateTime,
      availableDateTime
    }),
    [availableDateTime, disabledDate, disabledDateTime, mode]
  );
  const monthRuleCache = useMemo(
    () =>
      buildMonthRuleCache({
        currentDate,
        ...ruleContext
      }),
    [currentDate, ruleContext]
  );
  const getDateRule = useCallback(
    date => {
      const cached = monthRuleCache.get(date.format(DATE_FORMAT));
      if (cached !== undefined) {
        return cached;
      }
      return checkRule({
        date,
        ...ruleContext
      });
    },
    [monthRuleCache, ruleContext]
  );
  const slots = useMemo(
    () =>
      generateTimeSlots({
        date: selectedDate,
        events: selectedEvents,
        timeUnit,
        dayStart,
        dayEnd,
        disabledDate,
        disabledDateTime,
        availableDateTime,
        mode
      }),
    [availableDateTime, dayEnd, dayStart, disabledDate, disabledDateTime, mode, selectedDate, selectedEvents, timeUnit]
  );

  const handleSelectDate = (date, info) => {
    const nextDate = date.startOf('day').toDate();
    setValue(nextDate, info);
    onDateChange?.(nextDate, info);
    setSelectedSlots([]);
  };

  const handleCurrentChange = (date, info) => {
    setCurrent(date.startOf('month').toDate(), info);
  };

  const handleGoToday = () => {
    const today = dayjs().startOf('day');
    if (getDateRule(today)) {
      return;
    }
    handleSelectDate(today, { source: 'today' });
    handleCurrentChange(today, { source: 'today' });
  };

  const fullCellRender = date => {
    const key = date.format(DATE_FORMAT);
    const dayEvents = eventGroup[key] || [];
    const disabled = !!getDateRule(date);
    return <DateCell date={date} dayEvents={dayEvents} selected={date.isSame(selectedDate, 'day')} currentMonth={date.isSame(currentDate, 'month')} disabled={disabled} badgeMaxCount={badgeMaxCount} renderDateCell={renderDateCell} />;
  };

  return (
    <div className={style['schedule-calendar-shell']} style={propsStyle}>
      <div ref={rootRef} className={classNames(style['schedule-calendar'], stacked && style['schedule-calendar-stacked'], className)} data-schedule-layout={stacked ? 'stacked' : 'row'} style={stacked ? stackedLayoutStyle : undefined}>
        <div ref={calendarRef} className={style['calendar-side']}>
          <Calendar
            {...calendarProps}
            fullscreen={false}
            value={currentDate}
            headerRender={() => {
              const today = dayjs().startOf('day');
              const todayDisabled = !!getDateRule(today);
              return <Header current={currentDate} showTodayButton={!todayDisabled && (!selectedDate.isSame(today, 'day') || !currentDate.isSame(today, 'month'))} onCurrentChange={handleCurrentChange} onSelectToday={handleGoToday} />;
            }}
            fullCellRender={fullCellRender}
            disabledDate={date => !!getDateRule(date)}
            onSelect={date => {
              if (getDateRule(date)) {
                return;
              }
              handleSelectDate(date, { source: 'date' });
            }}
            onPanelChange={date => handleCurrentChange(date, { source: 'picker' })}
          />
        </div>
        <div className={style['panel-side']} {...panelProps}>
          {mode === 'schedule' ? (
            <SchedulePanel
              date={selectedDate}
              slots={slots}
              loading={loading}
              allowMultiSelect={allowMultiSelect}
              selectedSlots={selectedSlots}
              setSelectedSlots={setSelectedSlots}
              onSlotRangeChange={onSlotRangeChange}
              onFreeSlotClick={onFreeSlotClick}
              onCreate={onCreate}
              formInner={formInner}
              formProps={formProps}
              defaultFormValues={defaultFormValues}
              renderTimeSlot={renderTimeSlot}
              renderOccupiedSlot={renderOccupiedSlot}
              renderPanelHeader={renderPanelHeader}
              onEventClick={onEventClick}
            />
          ) : (
            <ViewPanel date={selectedDate} events={selectedEvents} loading={loading} renderEventItem={renderEventItem} renderPanelHeader={renderPanelHeader} onEventClick={onEventClick} />
          )}
        </div>
      </div>
    </div>
  );
};

export const ScheduleCalendar = withLocale(ScheduleCalendarInner);

export default ScheduleCalendar;

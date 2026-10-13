import { CSSProperties, FC, ReactNode } from 'react';

export type DateLike = string | Date;

export type CalendarMode = 'view' | 'schedule';

export type CalendarEvent = {
  id: string | number;
  title: string;
  detail?: ReactNode;
  date?: DateLike;
  start: DateLike;
  end: DateLike;
  disabled?: boolean;
  color?: string;
  raw?: unknown;
  onClick?: (event: CalendarEvent, ctx: { date: Date; mode: CalendarMode }) => void;
};

export type TimeSlot = {
  key: string;
  date: string;
  start: Date;
  end: Date;
  status: 'free' | 'occupied' | 'disabled';
  disabledReason?: ReactNode;
  events: CalendarEvent[];
};

export type ScheduleDateTimeRuleContext = {
  date: Date;
  slot?: {
    start: Date;
    end: Date;
  };
  mode: CalendarMode;
};

export type ScheduleChangeInfo = {
  source: 'date' | 'today';
};

export type CurrentChangeInfo = {
  source: 'prevMonth' | 'nextMonth' | 'picker' | 'today';
};

export type SlotRangeChangeInfo = {
  action: 'select' | 'clear';
  start?: Date;
  end?: Date;
};

export type ScheduleSelectionContext = {
  date: Date;
  start: Date | null;
  end: Date | null;
  slots: TimeSlot[];
  conflicts: CalendarEvent[];
};

export type ScheduleCalendarProps = {
  mode?: CalendarMode;
  locale?: 'zh-CN' | 'en-US' | string;
  value?: DateLike;
  defaultValue?: DateLike;
  onChange?: (date: Date, info: ScheduleChangeInfo) => void;
  onDateChange?: (date: Date, info: ScheduleChangeInfo) => void;
  onEventClick?: (event: CalendarEvent, ctx: { date: Date; mode: CalendarMode }) => void;
  current?: DateLike;
  defaultCurrent?: DateLike;
  onCurrentChange?: (date: Date, info: CurrentChangeInfo) => void;
  events?: CalendarEvent[];
  loading?: boolean;
  disabledDate?: (date: Date) => boolean;
  disabledDateTime?: (ctx: ScheduleDateTimeRuleContext) => boolean | { disabled?: boolean; reason?: ReactNode };
  availableDateTime?: (ctx: ScheduleDateTimeRuleContext) => boolean;
  badgeMaxCount?: number;
  timeUnit?: number;
  dayStart?: string;
  dayEnd?: string;
  timeStep?: number;
  hourHeight?: number;
  allowConflict?: boolean;
  allowMultiSelect?: boolean;
  renderEventItem?: (event: CalendarEvent, ctx: { date: Date; mode: CalendarMode; onEventClick?: ScheduleCalendarProps['onEventClick'] }) => ReactNode;
  renderDateCell?: (date: Date, ctx: { events: CalendarEvent[]; selected: boolean; currentMonth: boolean }) => ReactNode;
  renderEventBlock?: (event: CalendarEvent, ctx: { start: Date; end: Date }) => ReactNode;
  renderOccupiedSlot?: (slot: TimeSlot, ctx: { events: CalendarEvent[] }) => ReactNode;
  renderPanelHeader?: (ctx: { date: Date; mode: CalendarMode; events: CalendarEvent[] }) => ReactNode;
  formInner?: ReactNode;
  formProps?: Record<string, unknown>;
  defaultFormValues?: Record<string, unknown> | ((ctx: ScheduleSelectionContext) => Record<string, unknown>);
  onFreeSlotClick?: (slot: Pick<TimeSlot, 'key' | 'date' | 'start' | 'end' | 'status' | 'events'>) => void;
  onSlotRangeChange?: (slots: TimeSlot[], info: SlotRangeChangeInfo) => void;
  onCreate?: (values: Record<string, unknown>, ctx: ScheduleSelectionContext) => void | Promise<void>;
  className?: string;
  style?: CSSProperties;
  stackAt?: number;
  eventListScrollable?: boolean;
  calendarProps?: Record<string, unknown>;
  panelProps?: Record<string, unknown>;
};

export type GenerateTimeSlotsOptions = {
  date: DateLike;
  events?: CalendarEvent[];
  timeUnit?: number;
  dayStart?: string;
  dayEnd?: string;
  disabledDate?: (date: Date) => boolean;
  disabledDateTime?: ScheduleCalendarProps['disabledDateTime'];
  availableDateTime?: ScheduleCalendarProps['availableDateTime'];
  mode?: CalendarMode;
};

export type TimeWindowFormat = string | [string, string] | ((start: Date, end: Date) => ReactNode);

export type TimeWindowProps = {
  value?: [DateLike, DateLike];
  defaultValue?: [DateLike, DateLike];
  onChange?: (value: [Date, Date]) => void;
  duration?: number;
  range?: [DateLike | null, DateLike | null] | null;
  step?: number;
  visibleSpan?: number;
  size?: 'large' | 'default' | 'small';
  inertia?: boolean | number;
  resizable?: boolean;
  wheelEffect?: boolean;
  lockable?: boolean;
  locked?: boolean;
  defaultLocked?: boolean;
  onLockedChange?: (locked: boolean) => void;
  minDuration?: number;
  maxDuration?: number;
  debounceWait?: number;
  format?: TimeWindowFormat;
  separator?: ReactNode;
  showDuration?: boolean;
  locale?: 'zh-CN' | 'en-US' | string;
  className?: string;
  style?: CSSProperties;
};

export declare const ScheduleCalendar: FC<ScheduleCalendarProps>;
export declare const ReactCalendar: FC<ScheduleCalendarProps>;
export declare const TimeWindow: FC<TimeWindowProps>;

export declare function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]>;
export declare function generateTimeSlots(options: GenerateTimeSlotsOptions): TimeSlot[];
export declare function normalizeEvent(event: CalendarEvent): CalendarEvent & {
  start: import('dayjs').Dayjs | null;
  end: import('dayjs').Dayjs | null;
};
export declare function sortEventsByStart(events: CalendarEvent[]): CalendarEvent[];
export declare function dedupeEventsById(events: CalendarEvent[]): CalendarEvent[];

declare const _default: FC<ScheduleCalendarProps>;
export default _default;

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
  allowMultiSelect?: boolean;
  renderEventItem?: (event: CalendarEvent, ctx: { date: Date; mode: CalendarMode; onEventClick?: ScheduleCalendarProps['onEventClick'] }) => ReactNode;
  renderDateCell?: (date: Date, ctx: { events: CalendarEvent[]; selected: boolean; currentMonth: boolean }) => ReactNode;
  renderTimeSlot?: (slot: TimeSlot, ctx: { selected: boolean }) => ReactNode;
  renderOccupiedSlot?: (slot: TimeSlot, ctx: { events: CalendarEvent[] }) => ReactNode;
  renderPanelHeader?: (ctx: { date: Date; mode: CalendarMode; events: CalendarEvent[] }) => ReactNode;
  formInner?: ReactNode;
  formProps?: Record<string, unknown>;
  defaultFormValues?: Record<string, unknown> | ((ctx: { date: Date; slots: TimeSlot[] }) => Record<string, unknown>);
  onFreeSlotClick?: (slot: TimeSlot) => void;
  onSlotRangeChange?: (slots: TimeSlot[], info: SlotRangeChangeInfo) => void;
  onCreate?: (values: Record<string, unknown>, ctx: { date: Date; slots: TimeSlot[] }) => void | Promise<void>;
  className?: string;
  style?: CSSProperties;
  stackAt?: number;
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

export declare const ScheduleCalendar: FC<ScheduleCalendarProps>;
export declare const ReactCalendar: FC<ScheduleCalendarProps>;

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

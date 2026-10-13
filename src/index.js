import ScheduleCalendar from './ScheduleCalendar';
import TimeWindow from './components/TimeWindow';

export { groupEventsByDate, generateTimeSlots, normalizeEvent } from './events';
export { sortEventsByStart, dedupeEventsById } from './utils';
export { ScheduleCalendar, ScheduleCalendar as ReactCalendar, TimeWindow };
export default ScheduleCalendar;

import dayjs from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from './constants';
import { parseDayTime, toDayjs } from './utils';
import { checkRule } from './rules';

export const normalizeEvent = event => {
  const start = toDayjs(event.start || event.date);
  const end = toDayjs(event.end || event.start || event.date);
  return {
    ...event,
    start,
    end: end && start && !end.isAfter(start) ? start.add(1, 'minute') : end
  };
};

export const groupEventsByDate = events => {
  return (events || []).reduce((result, event) => {
    const normalized = normalizeEvent(event);
    if (!normalized.start || !normalized.end) {
      return result;
    }
    const startOfDay = normalized.start.startOf('day');
    const endOfDay = normalized.end.startOf('day');
    let current = startOfDay;
    while (current.isBefore(endOfDay) || current.isSame(endOfDay, 'day')) {
      const key = current.format(DATE_FORMAT);
      result[key] = result[key] || [];
      result[key].push(normalized);
      current = current.add(1, 'day');
    }
    return result;
  }, {});
};

const getOverlappingEvents = (slotStart, slotEnd, sortedEvents) => {
  const matched = [];
  for (const event of sortedEvents) {
    if (!event.end.isAfter(slotStart)) {
      continue;
    }
    if (!event.start.isBefore(slotEnd)) {
      break;
    }
    matched.push(event);
  }
  return matched;
};

export const generateTimeSlots = ({ date, events, timeUnit = 30, dayStart = '09:00', dayEnd = '18:00', disabledDate, disabledDateTime, availableDateTime, mode = 'schedule' }) => {
  const selectedDate = toDayjs(date) || dayjs();
  const startAt = parseDayTime(selectedDate, dayStart);
  const endAt = parseDayTime(selectedDate, dayEnd);
  if (!startAt.isBefore(endAt)) {
    return [];
  }
  const normalizedEvents = (events || [])
    .map(normalizeEvent)
    .filter(event => event.start && event.end)
    .sort((a, b) => a.start.valueOf() - b.start.valueOf());
  const slots = [];
  let current = startAt;

  while (current.isBefore(endAt)) {
    const slotStart = current;
    const slotEnd = slotStart.add(timeUnit, 'minute');
    const matchedEvents = getOverlappingEvents(slotStart, slotEnd, normalizedEvents);
    const baseSlot = {
      key: `${slotStart.format(DATE_FORMAT)}-${slotStart.format(TIME_FORMAT)}`,
      date: slotStart.format(DATE_FORMAT),
      start: slotStart,
      end: slotEnd
    };
    const ruleResult = checkRule({
      date: selectedDate,
      slot: baseSlot,
      mode,
      disabledDate,
      disabledDateTime,
      availableDateTime
    });

    slots.push({
      ...baseSlot,
      start: slotStart.toDate(),
      end: slotEnd.toDate(),
      status: ruleResult ? 'disabled' : matchedEvents.length > 0 ? 'occupied' : 'free',
      disabledReason: ruleResult?.reason,
      events: matchedEvents
    });
    current = slotEnd;
  }
  return slots;
};

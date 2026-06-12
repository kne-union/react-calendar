import dayjs from 'dayjs';
import useControlValue from '@kne/use-control-value';
import { DATE_FORMAT, TIME_FORMAT } from './constants';

export const classNames = (...list) =>
  list
    .flatMap(item => {
      if (!item) {
        return [];
      }
      if (typeof item === 'string') {
        return [item];
      }
      return Object.keys(item).filter(key => item[key]);
    })
    .join(' ');

export const toDayjs = value => {
  if (!value) {
    return null;
  }
  const date = dayjs(value);
  return date.isValid() ? date : null;
};

export const parseDayTime = (date, time) => {
  const day = toDayjs(date) || dayjs();
  const parsed = dayjs(`${day.format(DATE_FORMAT)} ${time}`, `${DATE_FORMAT} ${TIME_FORMAT}`);
  return parsed.isValid() ? parsed : day.startOf('day');
};

export const formatRange = (start, end) => `${dayjs(start).format(TIME_FORMAT)} - ${dayjs(end).format(TIME_FORMAT)}`;

export const getDefaultFormValues = (defaultFormValues, ctx) => {
  if (typeof defaultFormValues === 'function') {
    return defaultFormValues(ctx);
  }
  return {
    title: '',
    detail: '',
    ...(defaultFormValues || {})
  };
};

export const sortEventsByStart = events =>
  [...(events || [])].sort((a, b) => {
    const aStart = toDayjs(a.start)?.valueOf() ?? 0;
    const bStart = toDayjs(b.start)?.valueOf() ?? 0;
    return aStart - bStart;
  });

export const dedupeEventsById = events => {
  const map = new Map();
  (events || []).forEach(event => {
    map.set(event.id, event);
  });
  return [...map.values()];
};

export const useControlledState = ({ value, defaultValue, onChange }) => {
  const props = {};
  if (typeof value !== 'undefined') {
    props.value = value;
  }
  if (typeof defaultValue !== 'undefined') {
    props.defaultValue = defaultValue;
  }
  if (onChange) {
    props.onChange = onChange;
  }
  return useControlValue(props);
};

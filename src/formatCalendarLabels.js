import dayjs from 'dayjs';
import { toDayjs } from './utils';

const toDay = value => toDayjs(value) || dayjs();

export const getPanelDateLabel = (formatMessage, date) => {
  const d = toDay(date);
  return formatMessage(
    { id: 'PanelTitle.dateLabel' },
    {
      year: d.year(),
      month: d.month() + 1,
      day: d.date(),
      monthName: d.format('MMM')
    }
  );
};

export const getHeaderMonthLabel = (formatMessage, date) => {
  const d = toDay(date);
  return formatMessage(
    { id: 'Header.monthLabel' },
    {
      month: d.month() + 1,
      monthName: d.format('MMM')
    }
  );
};

export const getMonthPickerItemLabel = (formatMessage, value, monthIndex) => {
  const monthDate = toDay(value).month(monthIndex);
  return formatMessage(
    { id: 'Header.monthPickerItem' },
    {
      month: monthIndex + 1,
      monthName: monthDate.format('MMM')
    }
  );
};

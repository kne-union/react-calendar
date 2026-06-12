import dayjs from 'dayjs';
import { toDayjs } from './utils';

const toDay = value => toDayjs(value) || dayjs();

export const getMonthName = (formatMessage, monthIndex) => formatMessage({ id: `Calendar.month.${monthIndex + 1}` });

export const getPanelDateLabel = (formatMessage, date) => {
  const d = toDay(date);
  const monthIndex = d.month();
  return formatMessage(
    { id: 'PanelTitle.dateLabel' },
    {
      year: d.year(),
      month: monthIndex + 1,
      day: d.date(),
      monthName: getMonthName(formatMessage, monthIndex)
    }
  );
};

export const getHeaderMonthLabel = (formatMessage, date) => {
  const d = toDay(date);
  const monthIndex = d.month();
  return formatMessage(
    { id: 'Header.monthLabel' },
    {
      month: monthIndex + 1,
      monthName: getMonthName(formatMessage, monthIndex)
    }
  );
};

export const getMonthPickerItemLabel = (formatMessage, value, monthIndex) =>
  formatMessage(
    { id: 'Header.monthPickerItem' },
    {
      month: monthIndex + 1,
      monthName: getMonthName(formatMessage, monthIndex)
    }
  );

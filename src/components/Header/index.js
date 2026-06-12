import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Popover, Space } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { getHeaderMonthLabel } from '../../formatCalendarLabels';
import { toDayjs } from '../../utils';
import HeaderNavIcon from './NavIcon';
import YearPickerPanel from './YearPickerPanel';
import MonthPickerPanel from './MonthPickerPanel';
import { getYearPageStart } from './constants';
import style from './style.module.scss';

const HeaderNavButton = ({ label, onClick, children }) => (
  <button type="button" className={style['header-nav']} aria-label={label} onClick={onClick}>
    {children}
  </button>
);

const HeaderInner = ({ current, showTodayButton, onCurrentChange, onSelectToday }) => {
  const { formatMessage } = useIntl();
  const date = toDayjs(current) || dayjs();
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearPageStart, setYearPageStart] = useState(() => getYearPageStart(date.year()));
  const currentYear = date.year();
  const yearText = formatMessage({ id: 'Header.yearLabel' }, { year: date.year() });
  const monthText = getHeaderMonthLabel(formatMessage, date);

  useEffect(() => {
    if (yearOpen) {
      setYearPageStart(getYearPageStart(currentYear));
    }
  }, [yearOpen, currentYear]);

  const handleYearSelect = year => {
    onCurrentChange(date.year(year), { source: 'picker' });
    setYearOpen(false);
  };

  const handleMonthSelect = month => {
    onCurrentChange(date.month(month), { source: 'picker' });
    setMonthOpen(false);
  };

  return (
    <div className={style['calendar-header']}>
      <div className={style['calendar-title']}>
        <Popover
          open={yearOpen}
          onOpenChange={open => {
            setYearOpen(open);
            if (open) {
              setMonthOpen(false);
            }
          }}
          trigger="click"
          placement="bottomLeft"
          rootClassName={style['header-picker-popover']}
          content={<YearPickerPanel value={date} pageStart={yearPageStart} onPageStartChange={setYearPageStart} onSelect={handleYearSelect} />}
        >
          <button type="button" className={style['calendar-title-part']}>
            {yearText}
          </button>
        </Popover>
        <Popover
          open={monthOpen}
          onOpenChange={open => {
            setMonthOpen(open);
            if (open) {
              setYearOpen(false);
            }
          }}
          trigger="click"
          placement="bottomLeft"
          rootClassName={style['header-picker-popover']}
          content={<MonthPickerPanel value={date} onSelect={handleMonthSelect} />}
        >
          <button type="button" className={style['calendar-title-part']}>
            {monthText}
          </button>
        </Popover>
      </div>
      <Space size={4} className={style['header-actions']}>
        {showTodayButton ? (
          <Button className={style['header-today']} type="text" size="small" onClick={onSelectToday}>
            {formatMessage({ id: 'Header.today' })}
          </Button>
        ) : null}
        <HeaderNavButton label={formatMessage({ id: 'Header.prevMonth' })} onClick={() => onCurrentChange(date.subtract(1, 'month'), { source: 'prevMonth' })}>
          <HeaderNavIcon direction="prev" />
        </HeaderNavButton>
        <HeaderNavButton label={formatMessage({ id: 'Header.nextMonth' })} onClick={() => onCurrentChange(date.add(1, 'month'), { source: 'nextMonth' })}>
          <HeaderNavIcon direction="next" />
        </HeaderNavButton>
      </Space>
    </div>
  );
};

const Header = withLocale(HeaderInner);

export default Header;

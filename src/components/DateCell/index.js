import { Badge } from 'antd';
import { classNames } from '../../utils';
import style from './style.module.scss';

const DateCell = ({ date, dayEvents, selected, currentMonth, disabled, badgeMaxCount, renderDateCell }) => {
  const count = dayEvents.length;
  const customCell = renderDateCell?.(date.toDate(), {
    events: dayEvents,
    selected,
    currentMonth
  });
  if (customCell) {
    return customCell;
  }
  return (
    <div
      className={classNames(style['date-cell'], {
        [style['date-selected']]: selected,
        [style['date-muted']]: !currentMonth && !selected,
        [style['date-disabled']]: disabled && !selected,
        [style['date-has-events']]: count > 0 && !selected
      })}
    >
      <div className={style['date-number']}>{date.date()}</div>
      {count ? <Badge count={count > badgeMaxCount ? `${badgeMaxCount}+` : count} size="small" /> : null}
    </div>
  );
};

export default DateCell;

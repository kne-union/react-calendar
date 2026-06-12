import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import { getMonthPickerItemLabel } from '../../formatCalendarLabels';
import { classNames } from '../../utils';
import style from './style.module.scss';

const MonthPickerPanel = ({ value, onSelect }) => {
  const { formatMessage } = useIntl();
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);
  return (
    <div className={style['picker-panel']}>
      <div className={style['picker-panel-grid']}>
        {months.map(month => (
          <button key={month} type="button" className={classNames(style['picker-cell'], { [style['picker-cell-active']]: month === value.month() })} onClick={() => onSelect(month)}>
            {getMonthPickerItemLabel(formatMessage, value, month)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonthPickerPanel;

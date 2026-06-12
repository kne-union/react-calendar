import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { classNames } from '../../utils';
import HeaderNavIcon from './NavIcon';
import { YEAR_PAGE_SIZE } from './constants';
import style from './style.module.scss';

const PickerPanelNav = ({ label, onClick, children }) => (
  <button type="button" className={style['picker-panel-nav']} aria-label={label} onClick={onClick}>
    {children}
  </button>
);

const YearPickerPanelInner = ({ value, pageStart, onPageStartChange, onSelect }) => {
  const { formatMessage } = useIntl();
  const years = useMemo(() => Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => pageStart + index), [pageStart]);
  return (
    <div className={style['picker-panel']}>
      <div className={style['picker-panel-header']}>
        <PickerPanelNav label={formatMessage({ id: 'Header.prevYearPage' })} onClick={() => onPageStartChange(pageStart - YEAR_PAGE_SIZE)}>
          <HeaderNavIcon direction="prev" className={style['picker-panel-nav-icon']} />
        </PickerPanelNav>
        <div className={style['picker-panel-range']}>
          {pageStart}-{pageStart + YEAR_PAGE_SIZE - 1}
        </div>
        <PickerPanelNav label={formatMessage({ id: 'Header.nextYearPage' })} onClick={() => onPageStartChange(pageStart + YEAR_PAGE_SIZE)}>
          <HeaderNavIcon direction="next" className={style['picker-panel-nav-icon']} />
        </PickerPanelNav>
      </div>
      <div className={style['picker-panel-grid']}>
        {years.map(year => (
          <button key={year} type="button" className={classNames(style['picker-cell'], { [style['picker-cell-active']]: year === value.year() })} onClick={() => onSelect(year)}>
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

const YearPickerPanel = withLocale(YearPickerPanelInner);

export default YearPickerPanel;

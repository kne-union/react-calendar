import { useIntl } from '@kne/react-intl';
import { getPanelDateLabel } from '../../formatCalendarLabels';
import style from './style.module.scss';

const PanelTitle = ({ date, subtitle, count }) => {
  const { formatMessage } = useIntl();
  const dateText = getPanelDateLabel(formatMessage, date);
  const countText = typeof count === 'number' ? formatMessage({ id: 'PanelTitle.eventCount' }, { count }) : null;
  return (
    <div className={style['panel-title']}>
      <span>{dateText}</span>
      {subtitle || countText ? <span>{subtitle || countText}</span> : null}
    </div>
  );
};

export default PanelTitle;

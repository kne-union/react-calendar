import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { getPanelDateLabel } from '../../formatCalendarLabels';
import style from './style.module.scss';

const PanelTitleInner = ({ date, subtitle, count }) => {
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

const PanelTitle = withLocale(PanelTitleInner);

export default PanelTitle;

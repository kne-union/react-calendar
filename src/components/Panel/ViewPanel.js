import { useMemo, useRef } from 'react';
import { Card, Empty, List, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import { DATE_FORMAT } from '../../constants';
import { sortEventsByStart } from '../../utils';
import EventItem from '../EventItem';
import PanelTitle from './PanelTitle';
import PanelScrollShadow from './PanelScrollShadow';
import usePanelScrollShadow from './usePanelScrollShadow';
import style from './style.module.scss';

const ViewPanel = ({ date, events, loading, renderEventItem, renderPanelHeader, onEventClick }) => {
  const { formatMessage } = useIntl();
  const sortedEvents = useMemo(() => sortEventsByStart(events), [events]);
  const panelHeader = renderPanelHeader?.({ date: date.toDate(), mode: 'view', events: sortedEvents });
  const scrollRef = useRef(null);
  const { scrolled, onScroll } = usePanelScrollShadow(date.format(DATE_FORMAT), scrollRef);
  return (
    <Card bordered={false} title={panelHeader || <PanelTitle date={date} count={sortedEvents.length} />} className={style['panel-card']}>
      <Spin spinning={!!loading} classNames={{ root: style['panel-spin'], container: style['panel-spin-container'] }}>
        <div ref={scrollRef} className={style['panel-scroll-body']} onScroll={onScroll}>
          <PanelScrollShadow visible={scrolled} />
          <div className={style['panel-scroll-content']}>
            {sortedEvents.length ? (
              <List dataSource={sortedEvents} renderItem={event => <EventItem event={event} date={date.toDate()} mode="view" renderEventItem={renderEventItem} onEventClick={onEventClick} />} />
            ) : (
              <Empty description={formatMessage({ id: 'ViewPanel.empty' })} />
            )}
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default ViewPanel;

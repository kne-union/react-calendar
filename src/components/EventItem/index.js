import { List, Tag } from 'antd';
import { classNames, formatRange } from '../../utils';
import getEventTagLabel from './getEventTagLabel';
import style from './style.module.scss';

const EventItem = ({ event, date, mode, renderEventItem, onEventClick }) => {
  if (renderEventItem) {
    return renderEventItem(event, { date, mode, onEventClick });
  }
  const clickable = !event.disabled && (typeof event.onClick === 'function' || typeof onEventClick === 'function');
  const handleClick = () => {
    if (typeof event.onClick === 'function') {
      event.onClick(event, { date, mode });
      return;
    }
    onEventClick?.(event, { date, mode });
  };
  const tagLabel = getEventTagLabel(event);
  return (
    <List.Item className={style['event-list-item']}>
      <div
        className={classNames(style['event-item'], {
          [style['event-item-clickable']]: clickable,
          [style['event-item-disabled']]: event.disabled
        })}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? handleClick : undefined}
        onKeyDown={
          clickable
            ? eventKey => {
                if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                  eventKey.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
      >
        <div className={style['event-item-head']}>
          <div className={style['event-item-title']}>{event.title}</div>
          {tagLabel ? (
            <Tag className={style['event-item-tag']} color={event.color}>
              {tagLabel}
            </Tag>
          ) : null}
        </div>
        <div className={style['event-item-time']}>{formatRange(event.start, event.end)}</div>
        {event.detail ? <div className={style['event-item-detail']}>{event.detail}</div> : null}
      </div>
    </List.Item>
  );
};

export default EventItem;

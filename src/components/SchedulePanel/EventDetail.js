import { Tag } from 'antd';
import { classNames, formatRange } from '../../utils';
import getEventTagLabel from '../EventItem/getEventTagLabel';
import style from './style.module.scss';

const EventDetail = ({ event, date, onEventClick }) => {
  const clickable = !event.disabled && (typeof event.onClick === 'function' || typeof onEventClick === 'function');
  const handleClick = () => {
    if (typeof event.onClick === 'function') {
      event.onClick(event, { date, mode: 'schedule' });
      return;
    }
    onEventClick?.(event, { date, mode: 'schedule' });
  };
  const tagLabel = getEventTagLabel(event);
  return (
    <div
      className={classNames(style['event-detail'], { [style['event-detail-clickable']]: clickable, [style['event-detail-disabled']]: event.disabled })}
      style={event.color ? { '--timeline-event-color': event.color } : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={
        clickable
          ? keyEvent => {
              if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                keyEvent.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <span className={style['event-detail-bar']} />
      <div className={style['event-detail-body']}>
        <div className={style['event-detail-title']}>{event.title}</div>
        <div className={style['event-detail-time']}>{formatRange(event.start, event.end)}</div>
        {event.detail ? <div className={style['event-detail-text']}>{event.detail}</div> : null}
        {tagLabel ? (
          <Tag className={style['event-detail-tag']} color={event.color}>
            {tagLabel}
          </Tag>
        ) : null}
      </div>
    </div>
  );
};

export default EventDetail;

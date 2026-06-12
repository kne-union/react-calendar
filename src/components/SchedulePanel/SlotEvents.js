import { List } from 'antd';
import EventItem from '../EventItem';
import style from './style.module.scss';

const SlotEvents = ({ slot, date, onEventClick }) => (
  <div className={style['slot-popover-content']}>
    <List size="small" dataSource={slot.events} renderItem={event => <EventItem event={event} date={date} mode="schedule" onEventClick={onEventClick} />} />
  </div>
);

export default SlotEvents;

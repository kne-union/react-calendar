import React, {useEffect, useRef, useState} from 'react';
import Calendar from './dist/index.es';
// import moment from "moment";


export default () => {
  const [value, setValue] = useState(new Date());
  const calendarRef = useRef();
  const events = [
    {
      id: '1',
      scheduleId: '1',
      start: '2020-07-15 15:30:00',
      end: '2020-07-15 16:30:00',
      title: '测试1'
    },
    {
      id: '2',
      scheduleId: '1',
      start: '2020-07-15 12:30:00',
      end: '2020-07-15 13:30:00',
      title: '测试2'
    }
  ]
  const onDateClick = (arg) => {
    console.log('onDateClick', arg)
  }
  const onPrevClick = (date) => {
    console.log('onPrevClick', date)
  }
  const onTodayClick = (date) => {
    console.log('onTodayClick', date)
  }
  const handleChange = () => {
    // debugger
    calendarRef.current.getCalendarApi().changeView('timeGridDay', '2020-07-19');
    // setValue(new Date('2020-07-19'))
  }
  useEffect(() => {
    console.log('calendarRef', calendarRef.current)
  }, [])
  return (
      <div>
        <button onClick={handleChange}>change</button>
        <Calendar
            defaultDate={value}
            ref={calendarRef}
            events={events}
            dateClick={onDateClick}
            prevClick={onPrevClick}
            todayClick={onTodayClick}
            editable={true}
            droppable={true}
            selectable={true} />
      </div>
  );
}

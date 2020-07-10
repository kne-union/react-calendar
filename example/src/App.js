import React, {useEffect, useRef} from 'react';
import Calendar from './dist/index.es';
// import moment from "moment";


export default () => {
  const calendarRef = useRef();
  const events = [
    {
      id: '1',
      scheduleId: '1',
      start: '2020-07-07 15:30:00',
      end: '2020-07-07 16:30:00',
      title: '测试1'
    },
    {
      id: '2',
      scheduleId: '1',
      start: '2020-07-07 12:30:00',
      end: '2020-07-07 13:30:00',
      title: '测试2'
    }
  ]
  const onDateClick = (arg) => {
    debugger
    console.log('onDateClick', arg)
  }

  useEffect(() => {
    console.log('calendarRef', calendarRef.current)
  }, [])
  return (
      <div>
        <Calendar
            ref={calendarRef}
            events={events}
            onDateClick={onDateClick}
            editable={true}
            droppable={true}
            selectable={true} />
      </div>
  );
}
// const App = () => {
//
// }
//
// export default App;

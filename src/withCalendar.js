import React, {memo, useImperativeHandle, forwardRef, useRef } from 'react';
import objectHash from 'object-hash';
import Calendar from "./calendar";
import PropTypes from "prop-types";

export default memo(forwardRef((props, ref) => {
    const calendarRef = useRef();
    useImperativeHandle(ref, () => ({
        getCalendarApi: () => {
            return calendarRef.current.getApi();
        }
    }));
    // onDateClick: PropTypes.func,
    //     onEventClick: PropTypes.func,
    //     onSelect: PropTypes.func,
    //     onUnSelect: PropTypes.func,
    //     onEventDragStart: PropTypes.func,
    //     onEventDragStop: PropTypes.func,
    //     onEventDrop: PropTypes.func,
    //     onEventResizeStart: PropTypes.func,
    //     onEventResizeStop: PropTypes.func,
    //     onEventResize: PropTypes.func,
    // const {}


    return (
        <Calendar forwardedRef={calendarRef} {...props} />
    )
}), (prevProps, nextProps) => {
    return objectHash(prevProps) !== objectHash(nextProps);
});
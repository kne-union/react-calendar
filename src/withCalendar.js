import React, {memo, useImperativeHandle, forwardRef, useRef, useEffect} from 'react';
import objectHash from 'object-hash';
import Calendar from "./calendar";

export default memo(forwardRef((props, ref) => {
    const calendarRef = useRef();
    useImperativeHandle(ref, () => ({
        getCalendarApi: () => {
            return calendarRef.current.getApi();
        }
    }));
    return (
        <Calendar forwardedRef={calendarRef} {...props}  />
    )
}, (prevProps, nextProps) => {
    const flag = objectHash(prevProps) !== objectHash(nextProps)
    return flag;
}));
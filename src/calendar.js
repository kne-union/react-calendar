import React, { useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import FullCalendar  from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import momentPlugin from '@fullcalendar/moment';
import moment from "moment";
import './css/style.css';
export default class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inlineCustomButtons: props.customButtons
        }
    }

    componentDidMount() {
        const _customButtons = getInlineCustomButtons(this.props.forwardedRef.current.getApi(), this.props.customButtons)
        this.setState({
            inlineCustomButtons: _customButtons
        })
    }

    componentWillReceiveProps() {

    }

    render() {
        const {forwardedRef, ...rest} = this.props;
        return (
            <FullCalendar
                {...rest}
                customButtons={this.state.inlineCustomButtons}
                dateClick={this.props.onDateClick}
                plugins={[timeGridPlugin, interactionPlugin, momentPlugin]}
                ref={forwardedRef} />
        )
    }
}

Calendar.defaultProps = {
    initialDate: new Date(),
    height: 'auto',
    initialView: 'timeGridWeek',
    duration: '00:10:00',
    buttonIcons: {
        prev: 'chevron-left',
        next: 'chevron-right'
    },
    headerToolbar: {
        start: 'today', // will normally be on the left. if RTL, will be on the right
        center: '',
        end: 'prev,myEndTitle,next' // will normally be on the right. if RTL, will be on the left
    },
    slotLabelFormat:{
        hour: '2-digit',
        minute: '2-digit'
    },
    eventTimeFormat:{
        hour: '2-digit',
        minute: '2-digit',
        meridiem: true
    },
    weekends: true,
    editable: false,
    droppable: false,
    selectable: false
};

Calendar.propTypes = {
    initialDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    duration: PropTypes.string,
    initialView: PropTypes.string,
    customButtons: PropTypes.object,
    headerToolbar: PropTypes.object,
    buttonIcons: PropTypes.object,
    buttonText: PropTypes.object,
    allDay: PropTypes.bool,
    allDayText: PropTypes.string,
    labelFormat: PropTypes.object,
    eventTimeFormat: PropTypes.object,
    hiddenDays: PropTypes.array,
    weekends: PropTypes.bool,
    events: PropTypes.array,
    editable: PropTypes.bool,
    selectable: PropTypes.bool,
    droppable: PropTypes.bool,
    onDateClick: PropTypes.func,
    onEventClick: PropTypes.func,
    onSelect: PropTypes.func,
    onUnSelect: PropTypes.func,
    onEventDragStart: PropTypes.func,
    onEventDragStop: PropTypes.func,
    onEventDrop: PropTypes.func,
    onEventResizeStart: PropTypes.func,
    onEventResizeStop: PropTypes.func,
    onEventResize: PropTypes.func,
    dayHeaderDidMount: PropTypes.func,
    dayCellDidMount: PropTypes.func,
    eventDidMount: PropTypes.func
}

// 内置自定义按钮
function getInlineCustomButtons(calendar, customButtonProps) {
    moment.localeData().ordinal(24, 'W')

    const customButtons = {
        myEndTitle: {
            text: (function () {
                const date = calendar.getDate()
                return `第 ${moment(date).week()} 周`
            })()
        }
    }
    if(customButtonProps) {
        Object.keys(customButtons).forEach(key => {
            if(customButtonProps[key]){
                customButtons[key] = Object.assign({}, customButtons[key], customButtonProps[key])
            }
        })
    }
    return customButtons;
}
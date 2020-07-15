import React, {useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import momentPlugin from '@fullcalendar/moment';
import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import moment from "moment";
import './css/style.css';
const local = moment.weekdaysShort();
export default class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inlineCustomButtons: props.customButtons
        }
        this.columnHeaderHtml = this.columnHeaderHtml.bind(this);
        this.dayRender = this.dayRender.bind(this);
    }

    componentDidMount() {
        const _customButtons = getInlineCustomButtons(this.props.forwardedRef.current.getApi(), this.props, this.props.customButtons)
        this.setState({
            inlineCustomButtons: _customButtons
        })
    }

    dayRender(dayRenderInfo) {
        if (this.props.defaultView === 'timeGridWeek' && moment(dayRenderInfo.date).isSame(moment(this.props.defaultDate), 'day')) {
            dayRenderInfo.el.classList.add('fc-current');
        } else {
            dayRenderInfo.el.classList.remove('fc-current');
        }
    }

    columnHeaderHtml(date) {
        if (this.props.defaultView === 'timeGridWeek' && moment(date).isSame(moment(this.props.defaultDate), 'day')) {
            return `<span class="fc-current">${local[moment(date).day()]} ${moment(date).format('DD')}</span>`;
        } else {
            return `<span>${local[moment(date).day()]} ${moment(date).format('DD')}</span>`;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.defaultDate !== nextProps.defaultDate){
            this.props.forwardedRef.current.getApi().gotoDate(nextProps.defaultDate);
        }
        if (this.props.defaultDate !== nextProps.defaultDate){
            this.props.forwardedRef.current.getApi().gotoDate(nextProps.defaultDate);
        }
    }

    render() {
        const {forwardedRef, ...rest} = this.props;
        return (
            <FullCalendar
                dayRender={this.dayRender}
                columnHeaderHtml={this.columnHeaderHtml}
                {...rest}
                customButtons={this.state.inlineCustomButtons}
                plugins={[timeGridPlugin, interactionPlugin, momentPlugin]}
                ref={forwardedRef}/>
        )
    }
}

Calendar.defaultProps = {
    defaultDate: new Date(),
    height: 'auto',
    defaultView: 'timeGridWeek',
    slotDuration: '00:10:00',
    buttonIcons: {
        prev: 'chevron-left',
        next: 'chevron-right'
    },
    header: {
        left: 'customToday', // will normally be on the left. if RTL, will be on the right
        center: '',
        right: 'customPrev,customTitle,customNext' // will normally be on the right. if RTL, will be on the left
    },
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit'
    },
    eventTimeFormat: {
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
    defaultDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    slotDuration: PropTypes.string,
    defaultView: PropTypes.string,
    customButtons: PropTypes.object,
    header: PropTypes.object,
    buttonIcons: PropTypes.object,
    buttonText: PropTypes.object,
    allDaySlot: PropTypes.bool,
    allDayText: PropTypes.string,
    slotLabelFormat: PropTypes.object,
    eventTimeFormat: PropTypes.object,
    hiddenDays: PropTypes.array,
    weekends: PropTypes.bool,
    events: PropTypes.array,
    editable: PropTypes.bool,
    selectable: PropTypes.bool,
    droppable: PropTypes.bool,
    dateClick: PropTypes.func,
    eventClick: PropTypes.func,
    select: PropTypes.func,
    unselect: PropTypes.func,
    eventDragStart: PropTypes.func,
    eventDragStop: PropTypes.func,
    eventDrop: PropTypes.func,
    eventResizeStart: PropTypes.func,
    eventResizeStop: PropTypes.func,
    eventResize: PropTypes.func,
    columnHeaderHtml: PropTypes.func,
    dayRender: PropTypes.func,
    eventRender: PropTypes.func,
    prevClick: PropTypes.func,
    todayClick: PropTypes.func,
    nextClick: PropTypes.func
}

// 内置自定义按钮
function getInlineCustomButtons(calendar, props, customButtonProps) {
    const customButtons = {
        customTitle: {
            text: (function () {
                const date = calendar.getDate()
                return `第 ${moment(date).week()} 周`
            })()
        },
        customPrev: {
            icon: 'chevron-left',
            text: '<',
            click: function () {
                calendar.prev();
                let date = calendar.getDate();
                props.prevClick && props.prevClick(date);
            }
        },
        customNext: {
            icon: 'chevron-right',
            text: '>',
            click: function () {
                calendar.next();
                let date = calendar.getDate();
                props.nextClick && props.nextClick(date);
            }
        },
        customToday: {
            text: '今天',
            click: function () {
                calendar.gotoDate(new Date());
                let date = calendar.getDate();
                props.todayClick && props.todayClick(date);
            }
        }
    }
    if (customButtonProps) {
        Object.keys(customButtons).forEach(key => {
            if (customButtonProps[key]) {
                customButtons[key] = Object.assign({}, customButtons[key], customButtonProps[key])
            }
        })
    }
    return customButtons;
}
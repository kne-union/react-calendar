import { Popover, Tag, Tooltip } from 'antd';
import { useIntl } from '@kne/react-intl';
import { classNames, formatRange } from '../../utils';
import SlotEvents from './SlotEvents';
import style from './style.module.scss';

const SlotItem = ({ slot, date, selected, formPopover, popoverOpen, onPopoverOpenChange, onContextMenu, onMouseDown, onPointerDown, onMouseEnter, onMouseUp, onClick, onEventClick, renderTimeSlot, renderOccupiedSlot }) => {
  const { formatMessage } = useIntl();
  const content = renderTimeSlot?.(slot, { selected });
  if (content) {
    const customNode = (
      <div data-slot-index={slot.index} data-slot-status={slot.status} onContextMenu={onContextMenu} onMouseDown={onMouseDown} onPointerDown={onPointerDown} onMouseEnter={onMouseEnter} onMouseUp={onMouseUp} onClick={onClick}>
        {content}
      </div>
    );
    if (formPopover) {
      return (
        <Popover rootClassName={style['schedule-popover']} open={popoverOpen} onOpenChange={onPopoverOpenChange} content={formPopover} trigger="click" placement="bottom" autoAdjustOverflow>
          {customNode}
        </Popover>
      );
    }
    return customNode;
  }

  const wrapWithPopover = node => {
    if (formPopover) {
      return (
        <Popover rootClassName={style['schedule-popover']} open={popoverOpen} onOpenChange={onPopoverOpenChange} content={formPopover} trigger="click" placement="bottom" autoAdjustOverflow>
          {node}
        </Popover>
      );
    }
    if (slot.status === 'occupied') {
      return (
        <Popover
          rootClassName={style['schedule-popover']}
          open={popoverOpen}
          onOpenChange={onPopoverOpenChange}
          content={<SlotEvents slot={slot} date={date} onEventClick={onEventClick} />}
          trigger="click"
          placement="bottom"
          autoAdjustOverflow
        >
          {node}
        </Popover>
      );
    }
    if (slot.disabledReason) {
      return <Tooltip title={slot.disabledReason}>{node}</Tooltip>;
    }
    return node;
  };

  const slotClassName = classNames(style['slot-item'], style[`slot-${slot.status}`], {
    [style['slot-selected']]: selected
  });
  const slotChildren = (
    <>
      <span className={style['slot-dot']} />
      <span className={style['slot-time']}>{formatRange(slot.start, slot.end)}</span>
      {slot.status === 'disabled' ? <Tag className={style['slot-tag']}>{formatMessage({ id: 'SlotItem.disabled' })}</Tag> : null}
      {slot.status === 'occupied' ? (
        <Tag className={style['slot-tag']} color="red">
          {formatMessage({ id: 'SlotItem.occupied' })}
        </Tag>
      ) : null}
      {slot.status === 'occupied' && renderOccupiedSlot ? renderOccupiedSlot(slot, { events: slot.events }) : null}
      {slot.status === 'occupied' && !renderOccupiedSlot ? <span className={style['slot-title']}>{slot.events.map(event => event.title).join('、')}</span> : null}
    </>
  );
  const slotHandlers = {
    onContextMenu,
    onMouseDown,
    onPointerDown,
    onMouseEnter,
    onMouseUp,
    onClick
  };

  const inner =
    slot.status === 'disabled' ? (
      <button
        type="button"
        className={slotClassName}
        data-slot-index={slot.index}
        data-slot-status={slot.status}
        disabled
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onPointerDown={onPointerDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onClick={onClick}
      >
        {slotChildren}
      </button>
    ) : (
      <div role="button" tabIndex={0} className={slotClassName} data-slot-index={slot.index} data-slot-status={slot.status} {...slotHandlers}>
        {slotChildren}
      </div>
    );

  return wrapWithPopover(inner);
};

export default SlotItem;

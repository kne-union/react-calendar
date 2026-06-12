import { useMemo } from 'react';
import { Button, Card, Spin } from 'antd';
import { Form, SubmitButton } from '@kne/form-info';
import { useIntl } from '@kne/react-intl';
import { DATE_FORMAT } from '../../constants';
import useScheduleSelectionGesture from '../../useScheduleSelectionGesture';
import { classNames, dedupeEventsById, formatRange, getDefaultFormValues, sortEventsByStart } from '../../utils';
import PanelTitle from '../Panel/PanelTitle';
import PanelScrollShadow from '../Panel/PanelScrollShadow';
import usePanelScrollShadow from '../Panel/usePanelScrollShadow';
import panelStyle from '../Panel/style.module.scss';
import DefaultFormInner from './DefaultFormInner';
import SlotItem from './SlotItem';
import style from './style.module.scss';

const SchedulePanel = ({
  date,
  slots,
  loading,
  allowMultiSelect,
  selectedSlots,
  setSelectedSlots,
  onSlotRangeChange,
  onFreeSlotClick,
  onCreate,
  formInner,
  formProps,
  defaultFormValues,
  renderTimeSlot,
  renderOccupiedSlot,
  renderPanelHeader,
  onEventClick
}) => {
  const { formatMessage } = useIntl();
  const events = useMemo(() => sortEventsByStart(dedupeEventsById(slots.flatMap(slot => slot.events || []))), [slots]);
  const panelHeader = renderPanelHeader?.({ date: date.toDate(), mode: 'schedule', events });
  const { activePopoverKey, dragging, formPopoverKey, selectedAnchorKey, selectedKeys, selectSlots, slotsRef, handleMouseDown, handleMouseEnter, handleMouseUp, handleMouseLeave, handlePopoverOpenChange } = useScheduleSelectionGesture({
    slots,
    selectedSlots,
    setSelectedSlots,
    allowMultiSelect,
    onSlotRangeChange,
    onFreeSlotClick
  });

  const { scrolled, onScroll } = usePanelScrollShadow(date.format(DATE_FORMAT), slotsRef);
  const formContext = {
    date: date.toDate(),
    slots: selectedSlots
  };
  const formPopover =
    selectedSlots.length && !dragging ? (
      <div className={style['form-popover']}>
        <div className={style['form-popover-title']}>{formatMessage({ id: 'SchedulePanel.newSchedule' }, { range: formatRange(selectedSlots[0].start, selectedSlots[selectedSlots.length - 1].end) })}</div>
        <Form
          {...formProps}
          data={getDefaultFormValues(defaultFormValues, formContext)}
          onSubmit={async values => {
            try {
              await onCreate?.(values, formContext);
              selectSlots([]);
            } catch {
              // Keep the form open when creation fails.
            }
          }}
        >
          {formInner || <DefaultFormInner />}
          <div className={style['form-actions']}>
            <Button onClick={() => selectSlots([])}>{formatMessage({ id: 'SchedulePanel.cancel' })}</Button>
            <SubmitButton>{formatMessage({ id: 'SchedulePanel.save' })}</SubmitButton>
          </div>
        </Form>
      </div>
    ) : null;

  return (
    <Card bordered={false} title={panelHeader || <PanelTitle date={date} subtitle={formatMessage({ id: 'SchedulePanel.selectFreeSlot' })} />} className={panelStyle['panel-card']}>
      <Spin spinning={!!loading} classNames={{ root: panelStyle['panel-spin'], container: panelStyle['panel-spin-container'] }}>
        <div ref={slotsRef} className={classNames(style['slots'], { [style['slots-dragging']]: dragging })} onScroll={onScroll} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
          <PanelScrollShadow visible={scrolled} />
          <div className={style['slots-content']}>
            {slots.map((slot, index) => {
              const slotWithIndex = { ...slot, index };
              const occupiedPopoverKey = `occupied:${slot.key}`;
              const currentPopoverKey = slot.key === selectedAnchorKey && formPopover ? formPopoverKey : slot.status === 'occupied' ? occupiedPopoverKey : null;
              return (
                <SlotItem
                  key={slot.key}
                  slot={slotWithIndex}
                  date={date.toDate()}
                  selected={selectedKeys.has(slot.key)}
                  formPopover={slot.key === selectedAnchorKey ? formPopover : null}
                  popoverOpen={!!currentPopoverKey && activePopoverKey === currentPopoverKey}
                  onPopoverOpenChange={open => handlePopoverOpenChange(open, currentPopoverKey, { isForm: currentPopoverKey === formPopoverKey })}
                  renderTimeSlot={renderTimeSlot}
                  renderOccupiedSlot={renderOccupiedSlot}
                  onEventClick={onEventClick}
                  onContextMenu={event => {
                    if (slot.status === 'free') {
                      event.preventDefault();
                    }
                  }}
                  onMouseDown={event => handleMouseDown(event, slot, index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseUp={handleMouseUp}
                  onClick={undefined}
                />
              );
            })}
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default SchedulePanel;

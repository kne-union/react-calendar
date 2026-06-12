import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LONG_PRESS_DELAY = 360;
const MOVE_THRESHOLD = 18;

const getPopoverKey = slot => (slot ? `form:${slot.key}` : null);

const getSlotElementFromTouch = (container, touch) => {
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotElement = element?.closest?.('[data-slot-index]');
  if (!slotElement || !container?.contains(slotElement)) {
    return null;
  }
  return slotElement;
};

const getTouchPoint = event => event.changedTouches?.[0] || event.touches?.[0];

const useScheduleSelectionGesture = ({ slots, selectedSlots, setSelectedSlots, allowMultiSelect, onSlotRangeChange, onFreeSlotClick }) => {
  const [dragging, setDragging] = useState(false);
  const [activePopoverKey, setActivePopoverKey] = useState(null);
  const slotsRef = useRef(null);
  const draggingRef = useRef(false);
  const dragStartIndexRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const touchStateRef = useRef(null);
  const slotsDataRef = useRef(slots);
  const selectedSlotsRef = useRef(selectedSlots);
  const suppressTriggerUntilRef = useRef(0);

  slotsDataRef.current = slots;
  selectedSlotsRef.current = selectedSlots;

  const selectedKeys = useMemo(() => new Set(selectedSlots.map(slot => slot.key)), [selectedSlots]);
  const selectedAnchorKey = selectedSlots[selectedSlots.length - 1]?.key;
  const formPopoverKey = selectedAnchorKey ? `form:${selectedAnchorKey}` : null;

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const selectSlots = useCallback(
    nextSlots => {
      selectedSlotsRef.current = nextSlots;
      if (!nextSlots.length) {
        setActivePopoverKey(null);
      }
      setSelectedSlots(nextSlots);
      onSlotRangeChange?.(nextSlots, { action: nextSlots.length ? 'select' : 'clear' });
    },
    [onSlotRangeChange, setSelectedSlots]
  );

  const getSelectableRange = useCallback((startIndex, endIndex) => {
    const [start, end] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    return slotsDataRef.current.slice(start, end + 1).filter(slot => slot.status === 'free');
  }, []);

  const showFormPopoverForSlots = useCallback(slotsList => {
    const anchorSlot = slotsList[slotsList.length - 1];
    if (anchorSlot) {
      setActivePopoverKey(getPopoverKey(anchorSlot));
    }
  }, []);

  const startSlotSelection = useCallback(
    (slot, index, { showPopover = true } = {}) => {
      setActivePopoverKey(getPopoverKey(slot));
      draggingRef.current = true;
      dragStartIndexRef.current = index;
      slotsRef.current?.classList.add('schedule-calendar-touch-dragging');
      setDragging(true);
      selectSlots([slot]);
      if (!showPopover) {
        suppressTriggerUntilRef.current = Date.now() + 700;
        setActivePopoverKey(null);
      }
      onFreeSlotClick?.(slot);
    },
    [onFreeSlotClick, selectSlots]
  );

  const finishSelection = useCallback(
    ({ fromTouch = false } = {}) => {
      clearLongPress();
      draggingRef.current = false;
      dragStartIndexRef.current = null;
      slotsRef.current?.classList.remove('schedule-calendar-touch-dragging');
      setDragging(false);
      if (selectedSlotsRef.current.length) {
        if (fromTouch) {
          suppressTriggerUntilRef.current = Date.now() + 500;
        }
        showFormPopoverForSlots(selectedSlotsRef.current);
      }
    },
    [clearLongPress, showFormPopoverForSlots]
  );

  const updateSelectionRange = useCallback(
    index => {
      const startIndex = dragStartIndexRef.current;
      if (startIndex === null || !allowMultiSelect) {
        return;
      }
      const nextSlots = getSelectableRange(startIndex, index);
      selectSlots(nextSlots);
    },
    [allowMultiSelect, getSelectableRange, selectSlots]
  );

  const handleMouseDown = useCallback(
    (event, slot, index) => {
      if (slot.status !== 'free') {
        return;
      }
      event.preventDefault();
      startSlotSelection(slot, index);
    },
    [startSlotSelection]
  );

  const handleMouseEnter = useCallback(
    index => {
      if (!draggingRef.current) {
        return;
      }
      updateSelectionRange(index);
    },
    [updateSelectionRange]
  );

  const handlePopoverOpenChange = useCallback(
    (open, currentPopoverKey, { isForm = false } = {}) => {
      if (Date.now() < suppressTriggerUntilRef.current) {
        return;
      }
      if (!open && isForm) {
        selectSlots([]);
        return;
      }
      setActivePopoverKey(prevKey => {
        if (open) {
          return currentPopoverKey;
        }
        return prevKey === currentPopoverKey ? null : prevKey;
      });
    },
    [selectSlots]
  );

  useEffect(() => {
    const container = slotsRef.current;
    if (!container) {
      return undefined;
    }

    const clearTouchState = () => {
      clearLongPress();
      if (!draggingRef.current) {
        slotsRef.current?.classList.remove('schedule-calendar-touch-dragging');
      }
      touchStateRef.current = null;
    };

    const handleTouchStart = event => {
      if (event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      const slotElement = getSlotElementFromTouch(container, touch);
      if (!slotElement) {
        return;
      }
      const index = Number(slotElement.getAttribute('data-slot-index'));
      const slot = slotsDataRef.current[index];
      if (Number.isNaN(index) || slot?.status !== 'free') {
        return;
      }

      clearTouchState();
      touchStateRef.current = {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        slot,
        index,
        moved: false,
        longPressed: false,
        active: false
      };

      longPressTimerRef.current = window.setTimeout(() => {
        const touchState = touchStateRef.current;
        if (!touchState) {
          return;
        }
        touchState.longPressed = true;
        touchState.active = true;
        slotsRef.current?.classList.add('schedule-calendar-touch-dragging');
        startSlotSelection(slot, index, { showPopover: false });
        longPressTimerRef.current = null;
      }, LONG_PRESS_DELAY);
    };

    const handleTouchMove = event => {
      const touchState = touchStateRef.current;
      if (!touchState) {
        return;
      }
      const touch = Array.from(event.touches).find(item => item.identifier === touchState.identifier) || event.touches[0];
      if (!touch) {
        return;
      }

      if (!touchState.active) {
        const moveX = Math.abs(touch.clientX - touchState.x);
        const moveY = Math.abs(touch.clientY - touchState.y);
        if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
          touchState.moved = true;
          clearTouchState();
        }
        return;
      }

      event.preventDefault();
      const slotElement = getSlotElementFromTouch(container, touch);
      if (!slotElement) {
        return;
      }
      const index = Number(slotElement.getAttribute('data-slot-index'));
      if (!Number.isNaN(index)) {
        updateSelectionRange(index);
      }
    };

    const handleTouchEnd = event => {
      const touchState = touchStateRef.current;
      if (!touchState) {
        return;
      }
      const touch = Array.from(event.changedTouches || []).find(item => item.identifier === touchState.identifier) || getTouchPoint(event);
      if (!touch) {
        clearTouchState();
        return;
      }

      if (touchState.active) {
        event.preventDefault();
        suppressTriggerUntilRef.current = Date.now() + 500;
        finishSelection({ fromTouch: true });
        touchStateRef.current = null;
        return;
      }

      const quickTap = !touchState.longPressed && !touchState.moved;
      clearTouchState();
      if (quickTap) {
        suppressTriggerUntilRef.current = Date.now() + 500;
        selectSlots([touchState.slot]);
        showFormPopoverForSlots([touchState.slot]);
        onFreeSlotClick?.(touchState.slot);
      }
    };

    const handleContextMenu = event => {
      if (touchStateRef.current || draggingRef.current) {
        event.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);

    return () => {
      clearTouchState();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [clearLongPress, finishSelection, onFreeSlotClick, selectSlots, showFormPopoverForSlots, startSlotSelection, updateSelectionRange]);

  return {
    activePopoverKey,
    dragging,
    formPopoverKey,
    selectedAnchorKey,
    selectedKeys,
    setActivePopoverKey,
    selectSlots,
    slotsRef,
    finishSelection,
    handleMouseDown,
    handleMouseEnter,
    handlePopoverOpenChange
  };
};

export default useScheduleSelectionGesture;

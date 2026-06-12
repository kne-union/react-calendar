import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LONG_PRESS_DELAY = 400;
const SCROLL_CANCEL_THRESHOLD = 12;
const TAP_MOVE_THRESHOLD = 8;

const getPopoverKey = slot => (slot ? `form:${slot.key}` : null);

const getSlotIndexFromPoint = (container, clientX, clientY) => {
  const slotElements = container?.querySelectorAll?.('[data-slot-index]');
  if (!slotElements?.length) {
    return null;
  }

  let closestIndex = null;
  let closestDistance = Infinity;

  for (const candidate of slotElements) {
    const rect = candidate.getBoundingClientRect();
    const index = Number(candidate.getAttribute('data-slot-index'));
    if (Number.isNaN(index)) {
      continue;
    }

    if (clientY >= rect.top && clientY <= rect.bottom && clientX >= rect.left && clientX <= rect.right) {
      return index;
    }

    if (clientX < rect.left || clientX > rect.right) {
      continue;
    }

    const centerY = (rect.top + rect.bottom) / 2;
    const distance = Math.abs(clientY - centerY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
};

const clearDocumentTextSelection = () => {
  const selection = document.getSelection?.();
  if (selection && !selection.isCollapsed) {
    selection.removeAllRanges();
  }
};

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
  const allowMultiSelectRef = useRef(allowMultiSelect);
  const suppressTriggerUntilRef = useRef(0);
  const suppressMouseUntilRef = useRef(0);
  const scrollLockRef = useRef(null);
  const handlersRef = useRef({});

  slotsDataRef.current = slots;
  selectedSlotsRef.current = selectedSlots;
  allowMultiSelectRef.current = allowMultiSelect;

  const selectedKeys = useMemo(() => new Set(selectedSlots.map(slot => slot.key)), [selectedSlots]);
  const selectedAnchorKey = selectedSlots[selectedSlots.length - 1]?.key;
  const formPopoverKey = selectedAnchorKey ? `form:${selectedAnchorKey}` : null;

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const unlockContainerScroll = useCallback(() => {
    const container = slotsRef.current;
    if (!container || scrollLockRef.current == null) {
      return;
    }
    const scrollTop = scrollLockRef.current;
    container.style.overflow = '';
    container.style.touchAction = '';
    container.scrollTop = scrollTop;
    scrollLockRef.current = null;
  }, []);

  const lockContainerScroll = useCallback(() => {
    const container = slotsRef.current;
    if (!container || scrollLockRef.current != null) {
      return;
    }
    scrollLockRef.current = container.scrollTop;
    container.style.overflow = 'hidden';
    container.style.touchAction = 'none';
  }, []);

  const resetGestureState = useCallback(() => {
    clearLongPress();
    const container = slotsRef.current;
    const touchState = touchStateRef.current;
    if (container && touchState?.pointerId != null && container.hasPointerCapture?.(touchState.pointerId)) {
      try {
        container.releasePointerCapture(touchState.pointerId);
      } catch {
        // Ignore capture release errors on stale pointers.
      }
    }
    draggingRef.current = false;
    dragStartIndexRef.current = null;
    touchStateRef.current = null;
    container?.classList.remove('schedule-calendar-touch-dragging');
    unlockContainerScroll();
    setDragging(false);
  }, [clearLongPress, unlockContainerScroll]);

  const selectSlots = useCallback(
    nextSlots => {
      selectedSlotsRef.current = nextSlots;
      if (!nextSlots.length) {
        setActivePopoverKey(null);
        resetGestureState();
      }
      setSelectedSlots(nextSlots);
      onSlotRangeChange?.(nextSlots, { action: nextSlots.length ? 'select' : 'clear' });
    },
    [onSlotRangeChange, resetGestureState, setSelectedSlots]
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
    (slot, index, { showPopover = true, lockScroll = false } = {}) => {
      clearDocumentTextSelection();
      setActivePopoverKey(getPopoverKey(slot));
      draggingRef.current = true;
      dragStartIndexRef.current = index;
      slotsRef.current?.classList.add('schedule-calendar-touch-dragging');
      if (lockScroll) {
        lockContainerScroll();
      }
      setDragging(true);
      selectSlots([slot]);
      if (!showPopover) {
        suppressTriggerUntilRef.current = Date.now() + 700;
        setActivePopoverKey(null);
      }
      onFreeSlotClick?.(slot);
    },
    [lockContainerScroll, onFreeSlotClick, selectSlots]
  );

  const finishSelection = useCallback(
    ({ fromTouch = false } = {}) => {
      const hadSelection = selectedSlotsRef.current.length > 0;
      resetGestureState();
      if (hadSelection) {
        if (fromTouch) {
          suppressTriggerUntilRef.current = Date.now() + 500;
        }
        showFormPopoverForSlots(selectedSlotsRef.current);
      }
    },
    [resetGestureState, showFormPopoverForSlots]
  );

  const updateSelectionRange = useCallback(
    index => {
      const startIndex = dragStartIndexRef.current;
      if (startIndex === null || !allowMultiSelectRef.current) {
        return;
      }
      const nextSlots = getSelectableRange(startIndex, index);
      selectSlots(nextSlots);
    },
    [getSelectableRange, selectSlots]
  );

  const shouldIgnoreMouseSelectionEvent = useCallback(() => {
    return !!touchStateRef.current || Date.now() < suppressMouseUntilRef.current;
  }, []);

  const handleMouseDown = useCallback(
    (event, slot, index) => {
      if (shouldIgnoreMouseSelectionEvent()) {
        return;
      }
      if (slot.status !== 'free') {
        return;
      }
      event.preventDefault();
      startSlotSelection(slot, index);
    },
    [shouldIgnoreMouseSelectionEvent, startSlotSelection]
  );

  const handleMouseEnter = useCallback(
    index => {
      if (shouldIgnoreMouseSelectionEvent() || !draggingRef.current) {
        return;
      }
      updateSelectionRange(index);
    },
    [shouldIgnoreMouseSelectionEvent, updateSelectionRange]
  );

  const handleMouseUp = useCallback(() => {
    if (shouldIgnoreMouseSelectionEvent()) {
      return;
    }
    finishSelection();
  }, [finishSelection, shouldIgnoreMouseSelectionEvent]);

  const handleMouseLeave = useCallback(() => {
    if (shouldIgnoreMouseSelectionEvent()) {
      return;
    }
    finishSelection();
  }, [finishSelection, shouldIgnoreMouseSelectionEvent]);

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

  handlersRef.current = {
    clearLongPress,
    finishSelection,
    onFreeSlotClick,
    resetGestureState,
    selectSlots,
    showFormPopoverForSlots,
    startSlotSelection,
    updateSelectionRange
  };

  useEffect(() => {
    const container = slotsRef.current;
    if (!container) {
      return undefined;
    }

    const releasePointerCapture = pointerId => {
      if (pointerId == null || !container.hasPointerCapture?.(pointerId)) {
        return;
      }
      try {
        container.releasePointerCapture(pointerId);
      } catch {
        // Ignore capture release errors on stale pointers.
      }
    };

    const clearPendingTouch = () => {
      handlersRef.current.clearLongPress();
      touchStateRef.current = null;
    };

    const isStillOnSameSlot = (touchState, clientX, clientY) => {
      const currentIndex = getSlotIndexFromPoint(container, clientX, clientY);
      return currentIndex === touchState.index;
    };

    const shouldCancelPendingGesture = (touchState, clientX, clientY) => {
      const moveX = Math.abs(clientX - touchState.x);
      const moveY = Math.abs(clientY - touchState.y);

      if (moveY > SCROLL_CANCEL_THRESHOLD) {
        return true;
      }

      if (!isStillOnSameSlot(touchState, clientX, clientY)) {
        return true;
      }

      if (!allowMultiSelectRef.current && (moveX > TAP_MOVE_THRESHOLD || moveY > TAP_MOVE_THRESHOLD)) {
        return true;
      }

      return false;
    };

    const activateLongPress = touchState => {
      if (!isStillOnSameSlot(touchState, touchState.lastX, touchState.lastY)) {
        return;
      }

      touchState.longPressed = true;
      touchState.active = true;
      clearDocumentTextSelection();

      try {
        container.setPointerCapture(touchState.pointerId);
      } catch {
        // Continue when capture is unavailable.
      }

      slotsRef.current?.classList.add('schedule-calendar-touch-dragging');
      handlersRef.current.startSlotSelection(touchState.slot, touchState.index, { showPopover: false, lockScroll: true });
    };

    const handlePointerDown = event => {
      if (event.pointerType === 'mouse' || event.isPrimary === false) {
        return;
      }

      const slotElement = event.target?.closest?.('[data-slot-index]');
      if (!slotElement || !container.contains(slotElement)) {
        return;
      }

      const index = Number(slotElement.getAttribute('data-slot-index'));
      const slot = slotsDataRef.current[index];
      if (Number.isNaN(index) || slot?.status !== 'free') {
        return;
      }

      handlersRef.current.resetGestureState();
      touchStateRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        slot,
        index,
        moved: false,
        longPressed: false,
        active: false,
        selectionTriggered: false
      };

      if (!allowMultiSelectRef.current) {
        return;
      }

      longPressTimerRef.current = window.setTimeout(() => {
        const touchState = touchStateRef.current;
        if (!touchState || touchState.pointerId !== event.pointerId || touchState.moved) {
          return;
        }
        activateLongPress(touchState);
        longPressTimerRef.current = null;
      }, LONG_PRESS_DELAY);
    };

    const handlePointerMove = event => {
      const touchState = touchStateRef.current;
      if (!touchState || event.pointerId !== touchState.pointerId) {
        return;
      }

      touchState.lastX = event.clientX;
      touchState.lastY = event.clientY;

      if (!touchState.active) {
        if (shouldCancelPendingGesture(touchState, event.clientX, event.clientY)) {
          touchState.moved = true;
          clearPendingTouch();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      clearDocumentTextSelection();
      const index = getSlotIndexFromPoint(container, event.clientX, event.clientY);
      if (index !== null) {
        handlersRef.current.updateSelectionRange(index);
      }
    };

    const handlePointerUp = event => {
      const touchState = touchStateRef.current;
      if (!touchState || event.pointerId !== touchState.pointerId) {
        return;
      }

      releasePointerCapture(event.pointerId);
      suppressMouseUntilRef.current = Date.now() + 700;

      if (touchState.active) {
        event.preventDefault();
        touchState.selectionTriggered = true;
        const index = getSlotIndexFromPoint(container, event.clientX, event.clientY);
        if (index !== null) {
          handlersRef.current.updateSelectionRange(index);
        }
        suppressTriggerUntilRef.current = Date.now() + 500;
        handlersRef.current.finishSelection({ fromTouch: true });
        return;
      }

      handlersRef.current.clearLongPress();

      const quickTap =
        !touchState.moved &&
        !touchState.longPressed &&
        Math.abs(event.clientX - touchState.x) <= TAP_MOVE_THRESHOLD &&
        Math.abs(event.clientY - touchState.y) <= TAP_MOVE_THRESHOLD &&
        isStillOnSameSlot(touchState, event.clientX, event.clientY);

      const { slot } = touchState;
      touchStateRef.current = null;

      if (quickTap) {
        touchState.selectionTriggered = true;
        suppressTriggerUntilRef.current = Date.now() + 500;
        handlersRef.current.selectSlots([slot]);
        handlersRef.current.showFormPopoverForSlots([slot]);
        handlersRef.current.onFreeSlotClick?.(slot);
        return;
      }

      handlersRef.current.resetGestureState();
    };

    const handleContextMenu = event => {
      if (touchStateRef.current?.active || draggingRef.current) {
        event.preventDefault();
      }
    };

    const handleSelectStart = event => {
      if (!touchStateRef.current?.active && !draggingRef.current) {
        return;
      }
      event.preventDefault();
    };

    const handleTouchMove = event => {
      if (!draggingRef.current && !touchStateRef.current?.active) {
        return;
      }
      event.preventDefault();
    };

    const touchOptions = { passive: false, capture: true };
    container.addEventListener('pointerdown', handlePointerDown, { passive: true });
    container.addEventListener('pointermove', handlePointerMove, { passive: false });
    container.addEventListener('pointerup', handlePointerUp, { passive: false });
    container.addEventListener('pointercancel', handlePointerUp, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, touchOptions);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('selectstart', handleSelectStart);

    return () => {
      releasePointerCapture(touchStateRef.current?.pointerId);
      handlersRef.current.clearLongPress();
      handlersRef.current.resetGestureState();
      longPressTimerRef.current = null;
      container.removeEventListener('touchmove', handleTouchMove, touchOptions);
    };
  }, []);

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
    handleMouseUp,
    handleMouseLeave,
    handlePopoverOpenChange
  };
};

export default useScheduleSelectionGesture;

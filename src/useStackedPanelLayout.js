import { useLayoutEffect, useState } from 'react';
import { LAYOUT_MIN_HEIGHT } from './constants';

const measureHeight = node => {
  if (!node) {
    return 0;
  }
  return Math.ceil(node.getBoundingClientRect().height);
};

export const useStackedPanelLayout = (rootRef, calendarRef, stacked) => {
  const [layoutStyle, setLayoutStyle] = useState(undefined);

  useLayoutEffect(() => {
    if (!stacked) {
      setLayoutStyle(undefined);
      return undefined;
    }

    const root = rootRef.current;
    const calendar = calendarRef.current;
    if (!root || !calendar) {
      return undefined;
    }

    const update = () => {
      const calendarHeight = measureHeight(calendar);
      const panelViewportHeight = Math.max(calendarHeight, LAYOUT_MIN_HEIGHT);
      const totalHeight = calendarHeight + panelViewportHeight;
      setLayoutStyle({
        height: totalHeight,
        '--schedule-panel-top': `${calendarHeight}px`,
        '--schedule-panel-height': `${panelViewportHeight}px`
      });
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(calendar);
    observer.observe(root);
    return () => observer.disconnect();
  }, [calendarRef, rootRef, stacked]);

  return layoutStyle;
};

export default useStackedPanelLayout;

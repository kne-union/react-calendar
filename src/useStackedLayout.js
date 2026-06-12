import { useEffect, useLayoutEffect, useState } from 'react';

const readWidth = node => {
  if (!node) {
    return 0;
  }
  return node.getBoundingClientRect().width;
};

export const useStackedLayout = (ref, stackAt) => {
  const [stacked, setStacked] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    setStacked(readWidth(node) < stackAt);
  }, [ref, stackAt]);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    const update = () => {
      setStacked(readWidth(node) < stackAt);
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const observer = new ResizeObserver(() => update());
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, stackAt]);

  return stacked;
};

export default useStackedLayout;

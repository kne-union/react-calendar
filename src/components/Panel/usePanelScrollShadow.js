import { useCallback, useEffect, useState } from 'react';
import { classNames } from '../../utils';
import style from './style.module.scss';

const usePanelScrollShadow = (resetKey, scrollRef) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = 0;
    }
    setScrolled(false);
  }, [resetKey, scrollRef]);

  const onScroll = useCallback(event => {
    setScrolled(event.currentTarget.scrollTop > 0);
  }, []);

  return { scrolled, onScroll };
};

export default usePanelScrollShadow;

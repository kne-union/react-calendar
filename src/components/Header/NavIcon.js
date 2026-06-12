import style from './style.module.scss';

const HeaderNavIcon = ({ direction, className }) => (
  <svg className={className || style['header-nav-icon']} viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={direction === 'prev' ? 'M10 4 L6 8 L10 12' : 'M6 4 L10 8 L6 12'} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default HeaderNavIcon;

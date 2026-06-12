import { classNames } from '../../utils';
import style from './style.module.scss';

const PanelScrollShadow = ({ visible }) => <div className={classNames(style['panel-scroll-shadow'], { [style['panel-scroll-shadow-visible']]: visible })} aria-hidden />;

export default PanelScrollShadow;

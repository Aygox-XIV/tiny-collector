import { useCallback, useContext } from 'react';
import { CgToggleOff, CgToggleOn } from 'react-icons/cg';
import { MdMonitor, MdSmartphone } from 'react-icons/md';
import { NavLink } from 'react-router';
import { changeStyle } from '../collectionSlice';
import { useAppDispatch } from '../store';
import { StyleInfoContext, useSmallScreenStyle } from '../style';

export const Header: React.FC = () => {
    const smallScreenStyle = useSmallScreenStyle();
    const [, setStyleInfo] = useContext(StyleInfoContext);
    const dispatch = useAppDispatch();
    const ToggleIcon = smallScreenStyle ? CgToggleOn : CgToggleOff;
    const toggleStlye = useCallback(() => {
        setStyleInfo({ smallScreen: !smallScreenStyle });
        dispatch(changeStyle({ smallScreen: !smallScreenStyle }));
    }, [dispatch, smallScreenStyle]);
    return (
        <div className="header">
            <div className="title">
                <NavLink to="/">Tiny Collector{!smallScreenStyle && ' -- a collection tracker for Tiny Shop'}</NavLink>
            </div>
            <div className="style-toggle" onClick={toggleStlye}>
                <span />
                <span className="style-toggle-icons">
                    <MdSmartphone />
                    <ToggleIcon />
                    <MdMonitor />
                </span>
                <span>{smallScreenStyle ? 'Small-screen mode' : 'Large-screen mode'}</span>
            </div>
        </div>
    );
};

import { NavLink } from 'react-router';
import type { NoProps } from '../util';

export const Header: React.FC<NoProps> = ({}) => {
    return (
        <div className="header">
            <div className="title">
                <NavLink to="/">TinyCollector -- a collection tracker for Tiny Shop</NavLink>
            </div>
            <div className="note">(NOTE: data is still incomplete)</div>
        </div>
    );
};

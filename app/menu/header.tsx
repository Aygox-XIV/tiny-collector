import { NavLink } from 'react-router';
import type { NoProps } from '../util';

export const Header: React.FC<NoProps> = ({}) => {
    return (
        <div className="header">
            <NavLink to="/">TinyCollector -- a collection tracker for Tiny Shop</NavLink>
        </div>
    );
};

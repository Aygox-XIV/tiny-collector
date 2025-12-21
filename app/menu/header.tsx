import { NavLink } from 'react-router';
import type { NoProps } from '../util';

export const Header: React.FC<NoProps> = ({}) => {
    return (
        <div className="header">
            <div className="title">
                <NavLink to="/">TinyCollector -- a collection tracker for Tiny Shop</NavLink>
            </div>
            <div className="note">
                (NOTE: data is still incomplete. Join{' '}
                <a className="text-with-link" href="https://discord.gg/tiny-shop-590578198056534018">
                    the Discord
                </a>{' '}
                to help populate it)
            </div>
        </div>
    );
};

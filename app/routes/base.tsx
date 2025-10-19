import { NavLink, Outlet } from 'react-router';
import type { Route } from './+types/base';

export default function Base({ loaderData, actionData, params, matches }: Route.ComponentProps) {
    return (
        <div className="content">
            <div className="header">
                <NavLink to="/">Header</NavLink>
            </div>
            <div className="menu-bar">
                <NavLink to="/catalog">Menu</NavLink>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

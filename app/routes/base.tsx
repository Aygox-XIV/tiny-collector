import { NavLink, Outlet } from 'react-router';
import { MenuBar } from '../menu/menubar';
import type { Route } from './+types/base';

export default function Base({ loaderData, actionData, params, matches }: Route.ComponentProps) {
    return (
        <div className="content">
            <div className="header">
                <NavLink to="/">Header</NavLink>
            </div>
            <MenuBar />
            <Outlet />
        </div>
    );
}
